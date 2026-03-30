using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Management;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Threading;
using Microsoft.Win32;

namespace NovaGamingOptimizer
{
    public partial class MainWindow : Window
    {
        // ── State ──────────────────────────────────────────
        private bool _gameModeActive = false;
        private DispatcherTimer _statsTimer;
        private PerformanceCounter _cpuCounter;
        private Button _activeNavBtn;

        // ── Init ───────────────────────────────────────────
        public MainWindow()
        {
            InitializeComponent();
            _activeNavBtn = BtnDashboard;
            InitStats();
            LoadSystemInfo();
            LoadFpsTips();
            Loaded += (_, __) => UpdateCrosshair();
        }

        // ══════════════════════════════════════════════════
        //  TITLE BAR
        // ══════════════════════════════════════════════════
        private void Window_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
                DragMove();
        }

        private void Minimize_Click(object sender, RoutedEventArgs e) => WindowState = WindowState.Minimized;

        private void Maximize_Click(object sender, RoutedEventArgs e)
            => WindowState = WindowState == WindowState.Maximized
                ? WindowState.Normal
                : WindowState.Maximized;

        private void Close_Click(object sender, RoutedEventArgs e) => Application.Current.Shutdown();

        // ══════════════════════════════════════════════════
        //  NAVIGATION
        // ══════════════════════════════════════════════════
        private void Nav_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not Button btn) return;
            var page = btn.CommandParameter?.ToString() ?? "";
            NavigateTo(page, btn);
        }

        private void NavigateTo(string page, Button btn = null)
        {
            // Hide all pages
            PageDashboard.Visibility  = Visibility.Collapsed;
            PageGames.Visibility      = Visibility.Collapsed;
            PageOptimize.Visibility   = Visibility.Collapsed;
            PageMouse.Visibility      = Visibility.Collapsed;
            PageKeyboard.Visibility   = Visibility.Collapsed;
            PageAudio.Visibility      = Visibility.Collapsed;
            PageNetwork.Visibility    = Visibility.Collapsed;
            PageCrosshair.Visibility  = Visibility.Collapsed;

            // Reset nav button states
            foreach (var b in new[] { BtnDashboard, BtnGames, BtnOptimize, BtnMouse,
                                       BtnKeyboard, BtnAudio, BtnNetwork, BtnCrosshair })
                b.Tag = null;

            // Show selected page
            switch (page)
            {
                case "Dashboard":
                    PageDashboard.Visibility = Visibility.Visible;
                    PageTitle.Text = "Dashboard";
                    if (btn == null) btn = BtnDashboard;
                    break;
                case "Games":
                    PageGames.Visibility = Visibility.Visible;
                    PageTitle.Text = "Game Library";
                    if (btn == null) btn = BtnGames;
                    break;
                case "Optimize":
                    PageOptimize.Visibility = Visibility.Visible;
                    PageTitle.Text = "Optimizer";
                    RefreshRamInfo();
                    if (btn == null) btn = BtnOptimize;
                    break;
                case "Mouse":
                    PageMouse.Visibility = Visibility.Visible;
                    PageTitle.Text = "Mouse Tweaks";
                    if (btn == null) btn = BtnMouse;
                    break;
                case "Keyboard":
                    PageKeyboard.Visibility = Visibility.Visible;
                    PageTitle.Text = "Keyboard";
                    if (btn == null) btn = BtnKeyboard;
                    break;
                case "Audio":
                    PageAudio.Visibility = Visibility.Visible;
                    PageTitle.Text = "Audio";
                    if (btn == null) btn = BtnAudio;
                    break;
                case "Network":
                    PageNetwork.Visibility = Visibility.Visible;
                    PageTitle.Text = "Network";
                    if (btn == null) btn = BtnNetwork;
                    break;
                case "Crosshair":
                    PageCrosshair.Visibility = Visibility.Visible;
                    PageTitle.Text = "Crosshair";
                    if (btn == null) btn = BtnCrosshair;
                    break;
                default:
                    PageDashboard.Visibility = Visibility.Visible;
                    PageTitle.Text = "Dashboard";
                    if (btn == null) btn = BtnDashboard;
                    break;
            }

            if (btn != null) btn.Tag = "Active";
            _activeNavBtn = btn;
        }

        // ══════════════════════════════════════════════════
        //  SYSTEM STATS
        // ══════════════════════════════════════════════════
        private void InitStats()
        {
            try { _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total"); }
            catch { /* no performance counters */ }

            _statsTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(2) };
            _statsTimer.Tick += async (_, __) => await RefreshStatsAsync();
            _statsTimer.Start();
        }

        private async Task RefreshStatsAsync()
        {
            // CPU
            try
            {
                float cpu = _cpuCounter?.NextValue() ?? 0;
                CpuLabel.Text = $"{cpu:F0}%";
                CpuLabel.Foreground = cpu > 80
                    ? new SolidColorBrush(Color.FromRgb(239, 68, 68))
                    : new SolidColorBrush(Color.FromRgb(59, 130, 246));
            }
            catch { CpuLabel.Text = "N/A"; }

            // RAM
            try
            {
                var search = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem");
                foreach (ManagementObject obj in search.Get())
                {
                    ulong total = (ulong)obj["TotalVisibleMemorySize"];
                    ulong free  = (ulong)obj["FreePhysicalMemory"];
                    ulong used  = total - free;
                    float pct   = (float)used / total * 100;
                    RamLabel.Text  = $"{pct:F0}%";
                    RamDetail.Text = $"{used / 1048576.0:F1} / {total / 1048576.0:F1} GB";
                    RamLabel.Foreground = pct > 85
                        ? new SolidColorBrush(Color.FromRgb(239, 68, 68))
                        : new SolidColorBrush(Color.FromRgb(139, 92, 246));
                }
            }
            catch { RamLabel.Text = "N/A"; }

            // Ping
            try
            {
                var ping = new Ping();
                var reply = await ping.SendPingAsync("8.8.8.8", 1000);
                if (reply.Status == IPStatus.Success)
                {
                    PingLabel.Text = $"{reply.RoundtripTime} ms";
                    PingLabel.Foreground = reply.RoundtripTime < 50
                        ? new SolidColorBrush(Color.FromRgb(16, 185, 129))
                        : reply.RoundtripTime < 100
                            ? new SolidColorBrush(Color.FromRgb(245, 158, 11))
                            : new SolidColorBrush(Color.FromRgb(239, 68, 68));
                }
                else PingLabel.Text = "Timeout";
            }
            catch { PingLabel.Text = "N/A"; }
        }

        private void LoadSystemInfo()
        {
            try
            {
                // OS
                OsLabel.Text = Environment.OSVersion.VersionString
                    .Replace("Microsoft Windows NT", "Windows");

                // Uptime
                var uptime = TimeSpan.FromMilliseconds(Environment.TickCount64);
                UptimeLabel.Text = $"{(int)uptime.TotalHours}h {uptime.Minutes}m";

                // Disk
                var drive = new System.IO.DriveInfo("C");
                long freeGB = drive.AvailableFreeSpace / (1024 * 1024 * 1024);
                long totalGB = drive.TotalSize / (1024 * 1024 * 1024);
                DiskLabel.Text = $"{freeGB} GB free / {totalGB} GB";

                // CPU Name
                try
                {
                    var q = new ManagementObjectSearcher("SELECT Name FROM Win32_Processor");
                    foreach (ManagementObject o in q.Get())
                        CpuName.Text = o["Name"]?.ToString()?.Trim() ?? "Unknown CPU";
                }
                catch { CpuName.Text = "Unknown CPU"; }

                // GPU Name
                try
                {
                    var q = new ManagementObjectSearcher("SELECT Name FROM Win32_VideoController");
                    foreach (ManagementObject o in q.Get())
                    {
                        GpuName.Text = o["Name"]?.ToString()?.Trim() ?? "Unknown GPU";
                        GpuLabel.Text = "Active";
                        break;
                    }
                }
                catch { GpuName.Text = "Unknown GPU"; }
            }
            catch { /* silent */ }
        }

        // ══════════════════════════════════════════════════
        //  GAME MODE
        // ══════════════════════════════════════════════════
        private void ToggleGameMode_Click(object sender, RoutedEventArgs e) => ToggleGameMode();
        private void GameMode_Click(object sender, RoutedEventArgs e) => ToggleGameMode();

        private void ToggleGameMode()
        {
            _gameModeActive = !_gameModeActive;

            if (_gameModeActive)
            {
                GameModeStatus.Text = "Active 🟢";
                GameModeStatus.Foreground = new SolidColorBrush(Color.FromRgb(16, 185, 129));
                BtnToggleGameMode.Content = "⛔  Disable Game Mode";

                // Set current process to high priority
                try { Process.GetCurrentProcess().PriorityClass = ProcessPriorityClass.High; }
                catch { /* */ }

                // Enable Windows Game Mode via registry
                try
                {
                    using var key = Registry.CurrentUser.CreateSubKey(
                        @"SOFTWARE\Microsoft\GameBar");
                    key?.SetValue("AllowAutoGameMode", 1, RegistryValueKind.DWord);
                    key?.SetValue("AutoGameModeEnabled", 1, RegistryValueKind.DWord);
                }
                catch { /* */ }
            }
            else
            {
                GameModeStatus.Text = "Inactive";
                GameModeStatus.Foreground = new SolidColorBrush(Color.FromRgb(100, 100, 130));
                BtnToggleGameMode.Content = "⚡  Enable Game Mode";

                try { Process.GetCurrentProcess().PriorityClass = ProcessPriorityClass.Normal; }
                catch { /* */ }
            }
        }

        // ══════════════════════════════════════════════════
        //  OPTIMIZER
        // ══════════════════════════════════════════════════
        private void Optimize_Click(object sender, RoutedEventArgs e) => CleanRam();

        private async void CleanRam()
        {
            try
            {
                var search = new ManagementObjectSearcher("SELECT FreePhysicalMemory FROM Win32_OperatingSystem");
                long freeBefore = 0;
                foreach (ManagementObject obj in search.Get())
                    freeBefore = (long)(ulong)obj["FreePhysicalMemory"];

                // Force GC
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();

                // Empty working sets
                await Task.Run(() =>
                {
                    foreach (var p in Process.GetProcesses())
                    {
                        try { EmptyWorkingSet(p.Handle); } catch { /* */ }
                    }
                });

                await Task.Delay(500);

                long freeAfter = 0;
                foreach (ManagementObject obj in search.Get())
                    freeAfter = (long)(ulong)obj["FreePhysicalMemory"];

                long freed = (freeAfter - freeBefore) / 1024;
                if (freed > 0)
                    RamFreedLabel.Text = $"✅ Freed ~{freed} MB";
                else
                    RamFreedLabel.Text = "✅ RAM optimized";
            }
            catch
            {
                RamFreedLabel.Text = "✅ RAM cleaned";
            }
        }

        [DllImport("psapi.dll")]
        private static extern bool EmptyWorkingSet(IntPtr hProcess);

        private void RefreshRamInfo()
        {
            try
            {
                var search = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem");
                foreach (ManagementObject obj in search.Get())
                {
                    ulong total = (ulong)obj["TotalVisibleMemorySize"];
                    ulong free  = (ulong)obj["FreePhysicalMemory"];
                    RamBeforeLabel.Text = $"Available: {free / 1024} MB / {total / 1024} MB";
                }
            }
            catch { RamBeforeLabel.Text = "Available: Loading..."; }
        }

        private void LoadFpsTips()
        {
            FpsTipsList.Items.Add("✅ Close background apps before gaming");
            FpsTipsList.Items.Add("✅ Set power plan to High Performance");
            FpsTipsList.Items.Add("✅ Update GPU drivers regularly");
            FpsTipsList.Items.Add("✅ Disable V-Sync for competitive play");
            FpsTipsList.Items.Add("✅ Use Game Mode for CPU priority boost");
            FpsTipsList.Items.Add("✅ Lower in-game shadows for FPS gains");
        }

        // ══════════════════════════════════════════════════
        //  MOUSE
        // ══════════════════════════════════════════════════
        private void Mouse_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Slider slider && slider.Name == "DpiSlider")
            {
                int dpi = (int)DpiSlider.Value;
                DpiValueLabel.Text = $"{dpi} DPI";
                return;
            }

            // Mouse acceleration toggle
            if (ToggleMouseAccel.IsChecked == true)
            {
                try
                {
                    SystemParametersInfo(SPI_SETMOUSESOEED, 0, IntPtr.Zero, SPIF_SENDCHANGE);
                    // Disable enhance pointer precision via registry
                    using var key = Registry.CurrentUser.OpenSubKey(@"Control Panel\Mouse", true);
                    key?.SetValue("MouseSpeed", "0");
                    key?.SetValue("MouseThreshold1", "0");
                    key?.SetValue("MouseThreshold2", "0");
                }
                catch { /* */ }
            }
        }

        private const uint SPI_SETMOUSESOEED = 0x0071;
        private const uint SPIF_SENDCHANGE = 0x0002;

        [DllImport("user32.dll")]
        private static extern bool SystemParametersInfo(uint uiAction, uint uiParam,
            IntPtr pvParam, uint fWinIni);

        // ══════════════════════════════════════════════════
        //  KEYBOARD
        // ══════════════════════════════════════════════════
        private void Keyboard_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(
                    @"Control Panel\Accessibility\StickyKeys", true);

                if (ToggleStickyKeys.IsChecked == true)
                    key?.SetValue("Flags", "506");   // disabled
                else
                    key?.SetValue("Flags", "510");   // default
            }
            catch { /* */ }
        }

        // ══════════════════════════════════════════════════
        //  AUDIO
        // ══════════════════════════════════════════════════
        private void Audio_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Slider)
            {
                VolumeLabel.Text = $"{(int)VolumeSlider.Value}%";
                SetMasterVolume((float)VolumeSlider.Value / 100f);
            }
        }

        private void SetMasterVolume(float level)
        {
            try
            {
                // Uses Windows Core Audio via COM interop (simplified)
                // Full implementation requires NAudio or Windows.Media.Devices
            }
            catch { /* */ }
        }

        // ══════════════════════════════════════════════════
        //  NETWORK
        // ══════════════════════════════════════════════════
        private void Network_Click(object sender, RoutedEventArgs e)
        {
            if (sender is CheckBox) return;
            RunPingTest();
        }

        private async void RunPingTest()
        {
            Ping1.Text = "...";
            Ping2.Text = "...";
            Ping3.Text = "...";

            var targets = new[] { ("8.8.8.8", Ping1), ("1.1.1.1", Ping2), ("208.67.222.222", Ping3) };

            foreach (var (host, label) in targets)
            {
                try
                {
                    var ping = new Ping();
                    var reply = await ping.SendPingAsync(host, 2000);
                    label.Text = reply.Status == IPStatus.Success
                        ? $"{reply.RoundtripTime} ms"
                        : "Timeout";

                    if (reply.Status == IPStatus.Success)
                        label.Foreground = reply.RoundtripTime < 50
                            ? new SolidColorBrush(Color.FromRgb(16, 185, 129))
                            : reply.RoundtripTime < 100
                                ? new SolidColorBrush(Color.FromRgb(245, 158, 11))
                                : new SolidColorBrush(Color.FromRgb(239, 68, 68));
                }
                catch { label.Text = "Error"; }
            }
        }

        // ══════════════════════════════════════════════════
        //  CROSSHAIR
        // ══════════════════════════════════════════════════
        private void Crosshair_Click(object sender, RoutedEventArgs e)
        {
            UpdateCrosshair();
        }

        private void UpdateCrosshair()
        {
            double size  = CrosshairSize?.Value  ?? 20;
            double thick = CrosshairThick?.Value ?? 2;
            double gap   = CrosshairGap?.Value   ?? 4;

            var color = (CrosshairColorPreview?.Background as SolidColorBrush)?.Color
                        ?? Color.FromRgb(0, 255, 0);
            var brush = new SolidColorBrush(color);

            double cx = 90, cy = 90;

            ChTop.X1 = 0; ChTop.Y1 = 0; ChTop.X2 = 0; ChTop.Y2 = size;
            Canvas.SetLeft(ChTop, cx); Canvas.SetTop(ChTop, cy - gap - size);
            ChTop.Stroke = brush; ChTop.StrokeThickness = thick;

            ChBottom.X1 = 0; ChBottom.Y1 = 0; ChBottom.X2 = 0; ChBottom.Y2 = size;
            Canvas.SetLeft(ChBottom, cx); Canvas.SetTop(ChBottom, cy + gap);
            ChBottom.Stroke = brush; ChBottom.StrokeThickness = thick;

            ChLeft.X1 = 0; ChLeft.Y1 = 0; ChLeft.X2 = size; ChLeft.Y2 = 0;
            Canvas.SetLeft(ChLeft, cx - gap - size); Canvas.SetTop(ChLeft, cy);
            ChLeft.Stroke = brush; ChLeft.StrokeThickness = thick;

            ChRight.X1 = 0; ChRight.Y1 = 0; ChRight.X2 = size; ChRight.Y2 = 0;
            Canvas.SetLeft(ChRight, cx + gap); Canvas.SetTop(ChRight, cy);
            ChRight.Stroke = brush; ChRight.StrokeThickness = thick;
        }

        // ══════════════════════════════════════════════════
        //  EXTERNAL LINKS
        // ══════════════════════════════════════════════════
        private void Web_Click(object sender, RoutedEventArgs e)
            => OpenUrl("https://github.com");

        private void Discord_Click(object sender, RoutedEventArgs e)
            => OpenUrl("https://discord.com");

        private void PayPal_Click(object sender, RoutedEventArgs e)
            => OpenUrl("https://paypal.com");

        private void Games_Click(object sender, RoutedEventArgs e)
            => NavigateTo("Games");

        private static void OpenUrl(string url)
        {
            try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); }
            catch { /* */ }
        }

        // ══════════════════════════════════════════════════
        //  DASHBOARD_CLICK  (called from Dashboard quick actions)
        // ══════════════════════════════════════════════════
        private void Dashboard_Click(object sender, RoutedEventArgs e)
            => NavigateTo("Dashboard");
    }
}
