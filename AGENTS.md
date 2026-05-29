# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

This is **AashaDigitalIndia24Testing** — an ASP.NET MVC 5 application targeting .NET Framework 4.7. It is a multi-tenant B2B/B2C digital financial services portal (recharge, DMT, AEPS, UPI, bill payments, etc.) with a multi-tier distributor hierarchy (Admin → White-Label → Master → Dealer → Retailer).

### Technology Stack

- **Runtime:** .NET Framework 4.7 (compiled with Mono 6.8 on Linux)
- **Web Framework:** ASP.NET MVC 5 + Web API 2 + SignalR 2.4
- **ORM:** Entity Framework 6.2
- **Database:** SQL Server (configured at `10.5.1.35`)
- **Background Jobs:** Quartz.NET 3.3
- **Dependencies:** NuGet packages in `/workspace/packages/`, pre-compiled DLLs in `Vastwebmulti/bin/`

### Building on Linux (Mono)

Run the build script:
```bash
./scripts/build-mono.sh
```

This uses `mcs` (Mono C# compiler) with explicit assembly references since `xbuild` has compatibility issues with the project's Roslyn compiler imports and Mono's framework. The script:
1. Extracts the source file list from the `.csproj`
2. Creates a `WindowsInterop.Stub.dll` (stub for WPF namespace used in `using` directives)
3. Compiles all source files with references to `Vastwebmulti/bin/*.dll` dependencies

### Running the Application

Start the web server with XSP4:
```bash
xsp4 --port 8080 --address 0.0.0.0 --root /workspace/Vastwebmulti --nonstop
```

**Known Limitation:** The application throws a `System.ArgumentException` at startup: "A route named 'MS_attributerouteWebApi' is already in the route collection." This is a Mono compatibility issue with `GlobalConfiguration.Configure(config => config.MapHttpAttributeRoutes())` in `Global.asax.cs`. This does NOT occur on Windows/IIS.

### Key Gotchas

1. **Cannot use `xbuild` directly** — The project imports `Microsoft.Net.Compilers.1.0.0` props which override the C# compiler to a Windows-only Roslyn `csc.exe`, and the 'portable' debug type is incompatible with Mono. Use `scripts/build-mono.sh` instead.

2. **No automated tests** — The repository has no test projects or test infrastructure.

3. **No lint tooling** — No `.editorconfig`, no analyzers configured for command-line use.

4. **External dependencies** — Some DLLs in `bin/` are from specific developer machines (hardcoded paths in `.csproj`). All required DLLs are already committed to `Vastwebmulti/bin/`.

5. **Database required for runtime** — Full application operation requires SQL Server with the `AashaDigitalIndia` database. Connection strings are in `Vastwebmulti/Web.config`.

6. **XSP4 version** — Ubuntu 24.04's packaged `mono-xsp4` (from default repos) crashes with a `TypeLoadException`. Install from the official Mono repository (`stable-focal`) to get a compatible version.

### NuGet Package Restore

```bash
mono /usr/local/bin/nuget.exe restore AashaDigitalIndia24Testing.sln
```

Packages are pre-committed in `/workspace/packages/` so this is usually a no-op.
