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

namespace Vastwebmulti.Models.Scheduling
{
    public class Radaint : IJob
    {
        public static string radianttoken;
        public static string radianagentid;
        public Task Execute(IJobExecutionContext context)
        {
            var task = Task.Run(() =>
            {
                using (VastwebmultiEntities db = new VastwebmultiEntities())
                {

                    var infochk = db.Rem_UPI_REQUEST.Where(aa => aa.status == "PENDING" && aa.Bankrrn == "RADIANTQR").ToList();
                    foreach (var item in infochk)
                    {
                        Radiantdmt radi = new Radiantdmt();
                        var tokenchk = db.radianttokens.SingleOrDefault();
                        var radiantauthchk = db.radiantauths.SingleOrDefault();
                        var radiantresponse = db.rediantremtresponses.Where(aa => aa.userid == item.retailerid).SingleOrDefault();
                        if (tokenchk == null)
                        {
                            radi.Token(out radianttoken, out radianagentid, radiantauthchk.clientID, radiantauthchk.clientSecret, radiantauthchk.APIKey, radiantresponse.username, radiantresponse.password);
                        }
                        else
                        {
                            radianttoken = tokenchk.accessToken;
                            radianagentid = tokenchk.agentID;
                        }
                        var respchk = radi.UPIATMstatusCheck(radianagentid, radiantauthchk.clientID, radiantauthchk.clientSecret, radiantauthchk.APIKey, radianttoken,item.UPITXNID);
                        if (respchk.StatusCode == HttpStatusCode.NotAcceptable)
                        {
                            radi.Token(out radianttoken, out radianagentid, radiantauthchk.clientID, radiantauthchk.clientSecret, radiantauthchk.APIKey, radiantresponse.username, radiantresponse.password);
                            respchk = radi.UPIATMstatusCheck(radianagentid, radiantauthchk.clientID, radiantauthchk.clientSecret, radiantauthchk.APIKey, radianttoken, item.UPITXNID);
                        }

                    }
                }
            });
            return task;
        }
    }

}