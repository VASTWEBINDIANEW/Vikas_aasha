using Newtonsoft.Json;
using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using Vastwebmulti.Models;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Vastwebmulti
{
    public class AppNotification
    {
        public AppNotification()
        {
            var defInstance = FirebaseApp.DefaultInstance;
            if (defInstance == null)
            {
                var defaultApp = FirebaseApp.Create(new AppOptions()
                {
                    Credential =
                GoogleCredential.FromFile(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
                "notification.json")),
                });
            }
        }

        public async Task sendmessage(string userid, string text)
        {
            VastwebmultiEntities db = new VastwebmultiEntities();
            if (userid.Contains("vastweb"))
            {
                string company_name = db.Admin_details.SingleOrDefault().Companyname;
                await this.SendNotificationUsingTopic(userid, company_name, text);
            }
            else
            {
                var chk = (from jj in db.Users where jj.Email == userid select jj).SingleOrDefault();
                if (chk != null)
                {
                    try
                    {
                        var deviceId = db.Login_info.Where(p => p.UserId == userid || p.UserId == chk.UserId).OrderByDescending(p => p.Idno).Take(1).Single().DeviceId;
                        string company_name = db.Admin_details.SingleOrDefault().Companyname;

                        var message = new Message()
                        {
                            Notification = new FirebaseAdmin.Messaging.Notification
                            {
                                Title = company_name,
                                Body = text
                            },
                            Token = deviceId
                        };

                        string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);

                    }

                    catch (Exception ex)
                    {
                        string str = ex.Message;
                    }

                }
            }
        }

        public async Task<string> SendNotificationUsingTopic(string topic, string title, string message)
        {
            var messages = new List<Message>()
            {
                new Message()
                {
                    Notification = new FirebaseAdmin.Messaging.Notification()
                    {
                        Title = title,
                        Body = message,
                    },
                    Topic = topic,
                }
            };

            var response = await FirebaseMessaging.DefaultInstance.SendAllAsync(messages);
            // See the BatchResponse reference documentation
            // for the contents of response.
            return ($"{response.SuccessCount} messages were sent successfully");
        }
    }
}