using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class CaptureResponse_NEW
    {
        public string merchantId { get; set; }
        public string transType { get; set; }
        public string bioType { get; set; }
        public string dc { get; set; }
        public string ci { get; set; }
        public string hmac { get; set; }
        public string dpId { get; set; }
        public string mc { get; set; }
        public string pidDataType { get; set; }
        public string mi { get; set; }
        public string rdsId { get; set; }
        public string sessionKey { get; set; }
        public string fCount { get; set; }
        public string errCode { get; set; }
        public string pCount { get; set; }
        public string fType { get; set; }
        public string iCount { get; set; }
        public string pType { get; set; }
        public string srno { get; set; }
        public string pidData { get; set; }
        public string qScore { get; set; }
        public string nmPoints { get; set; }
        public string rdsVer { get; set; }
    }
}