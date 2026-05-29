#!/bin/bash
set -e

cd "$(dirname "$0")/.."
PROJECT_DIR="Vastwebmulti"

echo "=== Building AashaDigitalIndia24Testing with Mono ==="

# Extract source files from csproj
grep '<Compile Include=' "$PROJECT_DIR/AashaDigitalIndia24Testing.csproj" \
  | sed 's/.*Include="//' | sed 's/".*//' | sed 's/\\/\//g' \
  | sed 's/.*/"&"/' > /tmp/csproj_sources_quoted.txt

echo "Source files: $(wc -l < /tmp/csproj_sources_quoted.txt)"

# Create Windows Interop stub if not present
if [ ! -f "$PROJECT_DIR/bin/WindowsInterop.Stub.dll" ]; then
  echo 'namespace System.Windows.Interop { public class InteropBitmapStub {} }' > /tmp/WindowsInteropStub.cs
  mcs -target:library -out:"$PROJECT_DIR/bin/WindowsInterop.Stub.dll" /tmp/WindowsInteropStub.cs
  echo "Created WindowsInterop stub assembly"
fi

cd "$PROJECT_DIR"

mcs -target:library -out:bin/Vastwebmulti.dll -debug \
  -nowarn:1998,2002,0168,0219,0414,0108,0162,0114 \
  -nostdlib -noconfig \
  -r:/usr/lib/mono/4.5/mscorlib.dll \
  -r:/usr/lib/mono/4.5/System.dll \
  -r:/usr/lib/mono/4.5/System.Core.dll \
  -r:/usr/lib/mono/4.5/System.Data.dll \
  -r:/usr/lib/mono/4.5/System.Web.dll \
  -r:/usr/lib/mono/4.5/System.Web.Services.dll \
  -r:/usr/lib/mono/4.5/System.Xml.dll \
  -r:/usr/lib/mono/4.5/System.Xml.Linq.dll \
  -r:/usr/lib/mono/4.5/System.Net.Http.dll \
  -r:/usr/lib/mono/4.5/System.Configuration.dll \
  -r:/usr/lib/mono/4.5/System.Runtime.Serialization.dll \
  -r:/usr/lib/mono/4.5/System.ServiceModel.dll \
  -r:/usr/lib/mono/4.5/System.Drawing.dll \
  -r:/usr/lib/mono/4.5/System.ComponentModel.DataAnnotations.dll \
  -r:/usr/lib/mono/4.5/System.Web.ApplicationServices.dll \
  -r:/usr/lib/mono/4.5/System.Transactions.dll \
  -r:/usr/lib/mono/4.5/System.Web.Extensions.dll \
  -r:/usr/lib/mono/4.5/Microsoft.CSharp.dll \
  -r:/usr/lib/mono/4.5/System.IO.Compression.dll \
  -r:/usr/lib/mono/4.5/System.IO.Compression.FileSystem.dll \
  -r:/usr/lib/mono/4.5/System.Numerics.dll \
  -r:bin/System.Web.Mvc.dll \
  -r:bin/System.Web.Http.dll \
  -r:bin/System.Web.Http.WebHost.dll \
  -r:bin/System.Net.Http.Formatting.dll \
  -r:bin/System.Web.Helpers.dll \
  -r:bin/System.Web.Optimization.dll \
  -r:bin/System.Web.Razor.dll \
  -r:bin/System.Web.WebPages.dll \
  -r:bin/System.Web.WebPages.Razor.dll \
  -r:bin/System.Web.WebPages.Deployment.dll \
  -r:bin/System.Collections.Immutable.dll \
  -r:bin/System.Memory.dll \
  -r:bin/System.Buffers.dll \
  -r:bin/System.Runtime.CompilerServices.Unsafe.dll \
  -r:bin/System.Threading.Tasks.Extensions.dll \
  -r:bin/System.Text.Encodings.Web.dll \
  -r:bin/System.Text.Json.dll \
  -r:bin/System.ValueTuple.dll \
  -r:bin/System.Numerics.Vectors.dll \
  -r:bin/System.IO.Packaging.dll \
  -r:bin/System.Transactions.Workflows.dll \
  -r:bin/AEPS.dll \
  -r:bin/agAes.dll \
  -r:bin/Antlr3.Runtime.dll \
  -r:bin/Aspose.PDF.dll \
  -r:bin/BouncyCastle.Crypto.dll \
  -r:bin/ClassLibrary1.dll \
  -r:bin/ClosedXML.dll \
  -r:bin/CyberPlatOpenSSL.dll \
  -r:bin/DocumentFormat.OpenXml.dll \
  -r:bin/EntityFramework.dll \
  -r:bin/EntityFramework.SqlServer.dll \
  -r:bin/EPPlus.dll \
  -r:bin/EPPlus.Interfaces.dll \
  -r:bin/EPPlus.System.Drawing.dll \
  -r:bin/ExcelNumberFormat.dll \
  -r:bin/FirebaseAdmin.dll \
  -r:bin/Google.Api.Gax.dll \
  -r:bin/Google.Api.Gax.Rest.dll \
  -r:bin/Google.Apis.dll \
  -r:bin/Google.Apis.Auth.dll \
  -r:bin/Google.Apis.Auth.PlatformServices.dll \
  -r:bin/Google.Apis.Core.dll \
  -r:bin/Google.Apis.PlatformServices.dll \
  -r:bin/GoogleMaps.LocationServices.dll \
  -r:bin/LinqToExcel.dll \
  -r:bin/Microsoft.AI.Agent.Intercept.dll \
  -r:bin/Microsoft.AI.DependencyCollector.dll \
  -r:bin/Microsoft.AI.PerfCounterCollector.dll \
  -r:bin/Microsoft.AI.ServerTelemetryChannel.dll \
  -r:bin/Microsoft.AI.Web.dll \
  -r:bin/Microsoft.AI.WindowsServer.dll \
  -r:bin/Microsoft.ApplicationInsights.dll \
  -r:bin/Microsoft.AspNet.Identity.Core.dll \
  -r:bin/Microsoft.AspNet.Identity.EntityFramework.dll \
  -r:bin/Microsoft.AspNet.Identity.Owin.dll \
  -r:bin/Microsoft.AspNet.SignalR.Core.dll \
  -r:bin/Microsoft.AspNet.SignalR.SystemWeb.dll \
  -r:bin/Microsoft.Bcl.AsyncInterfaces.dll \
  -r:bin/Microsoft.CodeDom.Providers.DotNetCompilerPlatform.dll \
  -r:bin/Microsoft.Extensions.Logging.Abstractions.dll \
  -r:bin/Microsoft.Owin.dll \
  -r:bin/Microsoft.Owin.Host.SystemWeb.dll \
  -r:bin/Microsoft.Owin.Security.dll \
  -r:bin/Microsoft.Owin.Security.Cookies.dll \
  -r:bin/Microsoft.Owin.Security.Facebook.dll \
  -r:bin/Microsoft.Owin.Security.Google.dll \
  -r:bin/Microsoft.Owin.Security.MicrosoftAccount.dll \
  -r:bin/Microsoft.Owin.Security.OAuth.dll \
  -r:bin/Microsoft.Owin.Security.Twitter.dll \
  -r:bin/Microsoft.Web.Infrastructure.dll \
  -r:bin/Newtonsoft.Json.dll \
  -r:bin/Owin.dll \
  -r:bin/QRCoder.dll \
  -r:bin/Quartz.dll \
  -r:bin/RazorPDF.dll \
  -r:bin/RestSharp.dll \
  -r:bin/Rotativa.dll \
  -r:bin/ZXingNetMobile.dll \
  -r:bin/ZXing.Net.Mobile.Core.dll \
  -r:bin/Remotion.dll \
  -r:bin/Remotion.Data.Linq.dll \
  -r:bin/Remotion.Interfaces.dll \
  -r:bin/itextsharp.dll \
  -r:bin/itextsharp.xmlworker.dll \
  -r:bin/IKVM.OpenJDK.Core.dll \
  -r:bin/IKVM.OpenJDK.Security.dll \
  -r:bin/IKVM.OpenJDK.Text.dll \
  -r:bin/IKVM.OpenJDK.Util.dll \
  -r:bin/IKVM.Runtime.dll \
  -r:bin/IKVM.AWT.WinForms.dll \
  -r:bin/IKVM.OpenJDK.Beans.dll \
  -r:bin/IKVM.OpenJDK.Charsets.dll \
  -r:bin/IKVM.OpenJDK.Corba.dll \
  -r:bin/IKVM.OpenJDK.Management.dll \
  -r:bin/IKVM.OpenJDK.Media.dll \
  -r:bin/IKVM.OpenJDK.Naming.dll \
  -r:bin/IKVM.OpenJDK.Remoting.dll \
  -r:bin/IKVM.OpenJDK.SwingAWT.dll \
  -r:bin/IKVM.OpenJDK.XML.API.dll \
  -r:bin/IKVM.Runtime.JNI.dll \
  -r:bin/Microsoft.Win32.Primitives.dll \
  -r:bin/zxing.dll \
  -r:bin/zxing.presentation.dll \
  -r:bin/WebGrease.dll \
  -r:bin/WindowsInterop.Stub.dll \
  -r:bin/ConsoleApp1.exe \
  @/tmp/csproj_sources_quoted.txt

echo "=== Build successful: bin/Vastwebmulti.dll ==="
ls -la bin/Vastwebmulti.dll
