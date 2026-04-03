using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Vastwebmulti.Areas.ADMIN.Models
{
    public class cmsledgermodel
    {
        public int idno { get; set; }
        public string userid { get; set; }
        public string Description { get; set; }
        public decimal? Amount { get; set; }
        public decimal? Credit { get; set; }
        public decimal? Debit { get; set; }
        public decimal? RemainPre { get; set; }
        public decimal? RemainPost { get; set; }
        public DateTime? Insertdate { get; set; }
        public string Frm_Name { get; set; }
    }
}