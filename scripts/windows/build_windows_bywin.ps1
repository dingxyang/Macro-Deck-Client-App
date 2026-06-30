<#
.SYNOPSIS
  在 Windows 上检查并构建 Tauri 桌面端（dev/build），并做必要的环境检查与内存参数优化。
.DESCRIPTION
  主要流程：
  - 先做 4 项环境检查（C/C++、Rust + Windows target、pnpm、WebView2 Runtime）
  - 准备阶段：pnpm install、前端构建
  - 运行 pnpm tauri <dev|build>
.PARAMETER Command
  dev=开发模式，build=发布构建（生成 .exe / .msi），check=仅检查环境不构建。
.PARAMETER Yes
  自动确认（静默模式）。
#>
param(
  [Parameter(Position = 0)]
  [ValidateSet('dev', 'build', 'check')]
  [string]$Command,

  [Parameter(Position = 1)]
  [Alias('y')]
  [switch]$Yes
)

$ErrorActionPreference = 'Stop'
$Failed = $false

. (Join-Path $PSScriptRoot '_common.ps1')

if ($Yes) { Enable-AutoConfirm }

if ([string]::IsNullOrWhiteSpace($Command)) {
  Write-Host "用法：$($MyInvocation.MyCommand.Name) <dev|build|check> [-y]" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  dev        启动 Tauri 桌面开发模式（热重载）"
  Write-Host "  build      构建 Windows 可执行程序与安装包（.exe / .msi / .nsis）"
  Write-Host "  check      仅检查环境，不执行构建"
  Write-Host "  -y         自动确认所有安装提示（静默模式）"
  exit 1
}

Write-Host ""
Write-Banner -Title 'Windows 桌面构建环境检查（PowerShell）' -Color Cyan
Write-Host ""

# ─── [1/4] C/C++ 编译工具 ────────────────────────────────────────────────
Write-Host "[1/4] C/C++ 编译工具" -ForegroundColor Cyan
$hasMsvc = Test-Msvc
$hasGnu = Test-Gnu
if (-not $hasMsvc -and -not $hasGnu) {
  Write-Fail "未检测到 C/C++ 编译器（MSVC 或 GNU gcc）"
  Write-Fail "请运行 .\install_2_c_compile_bywin.ps1 安装"
}

# ─── [2/4] Rust + Windows 编译目标 ──────────────────────────────────────
Write-Host "[2/4] Rust + Windows 编译目标" -ForegroundColor Cyan
if ($null -eq (Get-ExePath 'rustc.exe')) {
  Write-Fail "未检测到 rustc/rustup"
  Write-Fail "请运行 .\install_3_rust_bywin.ps1 安装"
}
else {
  Test-RustToolchain | Out-Null

  # 根据已安装的 C 编译器选择 Windows target
  # MSVC → x86_64-pc-windows-msvc；GNU/MinGW → x86_64-pc-windows-gnu
  $preferredTarget = if ($hasMsvc) { 'x86_64-pc-windows-msvc' } else { 'x86_64-pc-windows-gnu' }
  $installedTargets = Get-RustupInstalledTarget
  if ($installedTargets -contains $preferredTarget) {
    Write-Ok "  $preferredTarget"
  }
  else {
    Write-Warn "  $preferredTarget（未安装），尝试自动安装 ..."
    Invoke-NativeStream -Block { & rustup target add $preferredTarget }
    if ($LASTEXITCODE -eq 0) { Write-Ok "  $preferredTarget 安装成功" }
    else { Write-Fail "  $preferredTarget 安装失败" }
  }
}

# ─── [3/4] pnpm ─────────────────────────────────────────────────────────
Write-Host "[3/4] pnpm" -ForegroundColor Cyan
$pnpmExe = Get-PnpmExe
if ($pnpmExe) {
  $v = (Invoke-NativeText -FilePath $pnpmExe -Arguments @('--version') | Select-Object -First 1)
  Write-Ok "pnpm $v 已安装"
}
else {
  Write-Warn "未找到 pnpm，准备自动安装 ..."
  $npm = Get-ExePath 'npm.cmd'
  if (-not $npm) { $npm = Get-ExePath 'npm.exe' }
  if (-not $npm) {
    Write-Fail "未找到 npm，无法自动安装 pnpm"
    Write-Fail "请先安装 Node.js，然后重试"
  }
  else {
    Write-Host "  运行命令：npm install -g pnpm" -ForegroundColor Cyan
    Invoke-NativeStream -Block { & npm install -g pnpm }
    $pnpmExe = Get-PnpmExe
    if ($pnpmExe) {
      $v = (Invoke-NativeText -FilePath $pnpmExe -Arguments @('--version') | Select-Object -First 1)
      Write-Ok "pnpm $v 安装成功"
    }
    else {
      Write-Fail "pnpm 自动安装失败，请手动安装：npm install -g pnpm"
    }
  }
}

# ─── [4/4] WebView2 Runtime ─────────────────────────────────────────────
Write-Host "[4/4] WebView2 Runtime" -ForegroundColor Cyan
$wv2RegPaths = @(
  'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
  'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
  'HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
)
$wv2Version = $null
foreach ($p in $wv2RegPaths) {
  try {
    $item = Get-ItemProperty -Path $p -ErrorAction Stop
    if ($item.pv) { $wv2Version = $item.pv; break }
  }
  catch { continue }
}
if ($wv2Version) {
  Write-Ok "WebView2 Runtime 已安装（$wv2Version）"
}
else {
  Write-Warn "WebView2 Runtime 未检测到（Windows 11 通常自带；若运行时缺失，Tauri 会自动下载或安装包会内嵌 bootstrapper）"
}

Write-Host ""
if ($Failed) {
  Write-Banner -Title '环境检查未通过，请修复以上问题后重试。' -Color Cyan -TitleColor Red
  exit 1
}

if ($Command -eq 'check') {
  Write-Banner -Title '所有检查通过！' -Color Cyan -TitleColor Green
  Write-Host ""
  exit 0
}

# ─── 构建准备 ───────────────────────────────────────────────────────────
Write-Banner -Title '构建准备                                ' -Color Cyan
Write-Host ""

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path

Write-Host "[准备 1/2] pnpm 依赖" -ForegroundColor Cyan
Write-Warn "正在运行 pnpm install ..."
Write-Host "  运行命令：pnpm install --config.node-linker=hoisted" -ForegroundColor Cyan
Invoke-NativeStreamIn -Path $projectRoot -Block { & pnpm install --config.node-linker=hoisted }
if ($LASTEXITCODE -ne 0) { Write-Fail "pnpm install 失败"; exit 1 }
else { Write-Ok "pnpm install 完成" }

Write-Host "[准备 2/2] 前端构建" -ForegroundColor Cyan
Write-Warn "正在运行前端构建 ..."
Write-Host "  运行命令：pnpm build" -ForegroundColor Cyan
Invoke-NativeStreamIn -Path $projectRoot -Block { & pnpm build }
if ($LASTEXITCODE -ne 0) { Write-Fail "前端构建失败"; exit 1 }
else { Write-Ok "前端构建完成" }

Write-Host ""
Write-Host "  构建准备完成！" -ForegroundColor Green
Write-Host ""

# ─── 加载 .env（env!() 宏与 dotenvy 在编译时需要 GITEE_PAT 等） ─────────
$envFile = Join-Path $projectRoot 'backend\src-tauri\.env'
if (Test-Path -LiteralPath $envFile) {
  Write-Ok "  加载环境变量文件：$envFile"
  $loaded = 0
  foreach ($line in (Get-Content -LiteralPath $envFile -ErrorAction SilentlyContinue)) {
    $trimmed = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith('#')) { continue }
    $eqIdx = $trimmed.IndexOf('=')
    if ($eqIdx -lt 1) { continue }
    $key = $trimmed.Substring(0, $eqIdx).Trim()
    $val = $trimmed.Substring($eqIdx + 1).Trim()
    if (-not [string]::IsNullOrWhiteSpace($key)) {
      Set-Item -Path "env:$key" -Value $val
      $loaded++
    }
  }
  if ($loaded -gt 0) { Write-Ok ".env 已加载（$loaded 个环境变量）" }
}
else {
  Write-Warn "未找到 backend\src-tauri\.env（部分编译期 env! 宏可能失败）"
}

# ─── 内存优化：单线程编译 windows crate，避免 Windows 上 OOM ────────────
$env:CARGO_BUILD_JOBS = '1'
$env:NODE_OPTIONS = '--max-old-space-size=8192 --max-semi-space-size=512'
# release 模式编译 windows crate 在低内存机器上常 OOM，降低 opt-level + 拆分 codegen-units 降峰值
$env:CARGO_PROFILE_RELEASE_OPT_LEVEL = '1'
$env:CARGO_PROFILE_RELEASE_CODEGEN_UNITS = '256'
$env:CARGO_PROFILE_RELEASE_LTO = 'false'
Write-Ok "  Set CARGO_BUILD_JOBS=1, NODE_OPTIONS=--max-old-space-size=8192（避免内存溢出）"
Write-Ok "  Release 优化降级：OPT_LEVEL=1, CODEGEN_UNITS=256, LTO=false（防 windows crate OOM）"
Write-Host ""

Write-Host "  运行命令：pnpm tauri $Command" -ForegroundColor Cyan
Write-Host ""

$code = 1
Push-Location $projectRoot
try {
  & pnpm tauri $Command
  $code = $LASTEXITCODE
}
finally {
  Pop-Location
}

# ─── 构建产物提示 ───────────────────────────────────────────────────────
if ($Command -eq 'build' -and $code -eq 0) {
  $bundleDir = Join-Path $projectRoot 'backend\src-tauri\target\release\bundle'
  $exePath = Join-Path $projectRoot 'backend\src-tauri\target\release\MyTodos.exe'
  Write-Host ""
  Write-Banner -Title '构建成功！' -Color Cyan -TitleColor Green
  if (Test-Path -LiteralPath $exePath) {
    Write-Ok "可执行文件：$exePath"
  }
  if (Test-Path -LiteralPath $bundleDir) {
    Write-Ok "安装包目录：$bundleDir"
    Get-ChildItem -LiteralPath $bundleDir -Recurse -File -Include '*.exe', '*.msi' -ErrorAction SilentlyContinue |
      ForEach-Object { Write-Host "    $($_.FullName)" -ForegroundColor Gray }
  }
}

exit $code
