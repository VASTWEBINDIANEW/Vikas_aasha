using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Quartz;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml;
using Vastwebmulti.Areas.RETAILER.Models;
using Vastwebmulti.Models;
using Vastwebmulti.Areas.RETAILER.Controllers;
namespace Vastwebmulti.Models.Scheduling
{
    public class upiresponsetask : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            var task = Task.Run(() =>
            {
                using (VastwebmultiEntities db = new VastwebmultiEntities())
                {
                    var paytmlist = db.Upi_txn_details.Where(s => s.AppName == "Paytm" && s.status.ToUpper() == "PENDING").ToList();
                    var phonepelist = db.Upi_txn_details.Where(s => s.AppName == "Phonepe" && s.status.ToUpper() == "PENDING").ToList();
                    Vastwebmulti.Areas.RETAILER.Controllers.HomeController d2 = new HomeController();
                    foreach (var i in paytmlist)
                    {
                       
                        d2.Paytmqrresponse(i.refid);
                    }   

                    foreach(var i in phonepelist)
                    {
                        d2.phonepeqrresponse(i.refid);
                    }




               }

            });
            return task;
        }
    }
}