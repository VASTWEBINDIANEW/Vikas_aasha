using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class HoldleanHIstrory
    {
        public string Name { get; set; }
        public string Firmname { get; set; }

        public DateTime? InsertDate { get; set; }
        public decimal? Amount { get; set; }
        public decimal? RemainPre { get; set; }
        public decimal? RemainPost { get; set; }
        public string Type { get; set; }
        public string RequestId { get; set; }
        public string Description { get; set; }
        public decimal? HoldRemainPre { get; set; }
        public decimal? HoldRemainPost { get; set; }
        public string Status { get; set; }
    }
}