<#
.SYNOPSIS
  在 Windows 上通过 Bundler 安装并检查 fastlane（基于仓库 Gemfile）。
.DESCRIPTION
  主要流程：
  - fastlane 官方 Android setup 推荐用 Gemfile + Bundler 管理 fastlane
  - 本仓库根目录 Gemfile 已声明 fastlane，这里执行 bundle install
  - 安装完成后，构建脚本通过 bundle exec fastlane build 调用
.PARAMETER CheckOnly
  只检查 Gemfile/Bundler/fastlane 命令解析，不执行 bundle install。
.EXAMPLE
  .\install_3_fastlane_bywin.ps1
.EXAMPLE
  .\install_3_fastlane_bywin.ps1 -CheckOnly
#>
param(
  [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '_common.ps1')

<#
.SYNOPSIS
  从注册表重新读取 机器级 + 用户级 PATH，合并注入当前 PowerShell 会话。
.NOTES
  install_2 刚装完的 Ruby/Bundler 把 ruby\bin 写入用户 PATH（注册表），但当前会话的
  $env:Path 是进程启动时的快照、不会自动刷新。调用本函数后，bundle 等命令即可在
  当前会话被 Get-Command 发现，无需重开窗口。
#>
function Sync-PathFromRegistry {
  $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $merged = @($machinePath, $userPath |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) }) -join ';'
  if (-not [string]::IsNullOrWhiteSpace($merged)) {
    $env:Path = $merged
  }
}

<#
.SYNOPSIS
  判断 Gemfile.lock 锁定的 Bundler 版本是否与当前 bundle 版本不一致。
.PARAMETER BundleRoot
  含 Gemfile / Gemfile.lock 的目录。
.OUTPUTS
  [bool] 不一致返回 true；无 lockfile、无 BUNDLED WITH 段或版本相同返回 false。
.NOTES
  lockfile 末尾 BUNDLED WITH 下一行即生成时的 Bundler 版本；与当前不一致时
  Bundler 会自动下载并切换到锁定版本重跑，故先对齐以避免无谓的旧版下载。
#>
function Test-LockfileBundlerMismatch {
  param([Parameter(Mandatory)] [string]$BundleRoot)

  $lockfile = Join-Path $BundleRoot 'Gemfile.lock'
  if (-not (Test-Path -LiteralPath $lockfile)) { return $false }

  $lines = Get-Content -LiteralPath $lockfile -ErrorAction SilentlyContinue
  $idx = [Array]::FindIndex($lines, [Predicate[string]] { param($l) $l.Trim() -eq 'BUNDLED WITH' })
  if ($idx -lt 0 -or $idx + 1 -ge $lines.Count) { return $false }
  $lockedVersion = $lines[$idx + 1].Trim()
  if ([string]::IsNullOrWhiteSpace($lockedVersion)) { return $false }

  $currentVersion = (Invoke-NativeText -FilePath 'bundle' -Arguments @('--version') |
    Select-Object -First 1) -replace '[^0-9.]', ''
  if ([string]::IsNullOrWhiteSpace($currentVersion)) { return $false }

  return ($lockedVersion -ne $currentVersion)
}

<#
.SYNOPSIS
  确保 Gemfile 中声明的 fastlane 可通过 Bundler 使用。
.OUTPUTS
  [bool] fastlane 可解析返回 true。
.NOTES
  Get-FastlaneBundleRoot 会优先查找 android\Gemfile，再查找仓库根 Gemfile；
  只有包含 gem 'fastlane' 的 Gemfile 会被采用。
#>
function Ensure-FastlaneBundle {
  $bundleRoot = Get-FastlaneBundleRoot
  if ([string]::IsNullOrWhiteSpace($bundleRoot)) {
    Write-Fail '未找到声明 fastlane 的 Gemfile'
    return $false
  }

  # bundle 由 install_2 安装；若刚在同一会话装完，PATH 可能尚未刷新，先从注册表重读再判断。
  if (-not (Get-CommandPath 'bundle')) {
    Sync-PathFromRegistry
  }
  if (-not (Require-Command 'bundle')) {
    Write-Host '请先运行 scripts\windows\install_2_ruby_bywin.ps1 安装 Ruby 与 Bundler。'
    Write-Host '若刚安装完，请关闭并重新打开 PowerShell 后再运行本脚本。'
    return $false
  }

  $gemfile = Join-Path $bundleRoot 'Gemfile'
  Write-Ok "使用 Gemfile：$gemfile"

  if (-not $CheckOnly) {
    # ① 配置 RubyGems 国内镜像（项目级，写入 $bundleRoot\.bundle\config，不污染全局）。
    #    rubygems.org 国内访问慢，bundle install 拉 fastlane 一大堆依赖会非常慢甚至超时。
    Write-Host '  配置 RubyGems 国内镜像（USTC）...' -ForegroundColor Cyan
    Invoke-NativeIn -Path $bundleRoot -Block {
      & bundle config set --local mirror.https://rubygems.org https://mirrors.ustc.edu.cn/rubygems
    } | Out-Null

    # ② 对齐 lockfile 的 BUNDLED WITH 与当前 Bundler 版本。
    #    否则 Bundler 4.x 见到 lockfile 锁的 2.4.10 会去下载并切换到旧版重跑（慢且无谓）。
    if (Test-LockfileBundlerMismatch -BundleRoot $bundleRoot) {
      Write-Warn 'Gemfile.lock 的 Bundler 版本与当前不一致，正在对齐 ...'
      Invoke-NativeIn -Path $bundleRoot -Block { & bundle update --bundler } | Out-Null
    }

    $code = Invoke-NativeIn -Path $bundleRoot -Block { & bundle install }
    if ($code -ne 0) {
      Write-Fail 'bundle install 执行失败'
      return $false
    }
  }

  $fastlane = Get-FastlaneCommand
  if ($fastlane) {
    Write-Ok "fastlane 命令：$($fastlane.Display)"
    return $true
  }

  Write-Fail 'bundle install 之后仍未找到 fastlane'
  return $false
}

Write-Banner 'Fastlane'

if (-not (Ensure-FastlaneBundle)) { exit 1 }
Write-Ok 'fastlane 已就绪'
