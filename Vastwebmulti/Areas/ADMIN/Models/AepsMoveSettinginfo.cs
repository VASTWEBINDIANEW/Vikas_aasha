using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Vastwebmulti.Areas.ADMIN.Models
{
    public class AepsMoveSettinginfo
    {
        public int Idno { get; set; }
        public string Userid { get; set; }
        public string ApiName1 { get; set; }
        public string ApiName2 { get; set; }
        public string UPIApiName1 { get; set; }
        public string UPIApiName2 { get; set; }
        public bool? Status1 { get; set; }
        public bool? Status2 { get; set; }
        public bool? UPIStatus1 { get; set; }
        public bool? UPIStatus2 { get; set; }
        public string FirmName { get; set; }
    }
}