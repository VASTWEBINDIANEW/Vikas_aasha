using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class VastBazaar
    {
        private string BaseURL = "http://api.vastbazaar.com";
        //  private string BaseURL = "http://localhost:62147";
        public IRestResponse Remitter_details(string mobile, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Remitter_details");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                mobile = mobile
            };
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse Remitter_details_UPI(string mobile, string token)
        {
            var url = BaseURL + "/api/COMPOSITE/Benlist";
            url = url + "?sendorno=" + mobile + "";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", "Bearer "+token);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Remitter_Verify_UPI(string mobile,string upiid, string token,string agentid)
        {
            var url = BaseURL + "/api/COMPOSITE/verify";
            url = url + "?senderno=" + mobile + "&upiid="+ upiid + "&agentid="+ agentid + "";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", "Bearer " + token);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse creaditRemitter_details(string mobile, string token)
        {
            var client = new RestClient(BaseURL + "/api/CREDITCARD/ben_details");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                mobile = mobile
            };
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Remitter_details_Wallet(string mobile, string token)
        {
            var url = BaseURL + "/api/DMTPAYTM/Benlist";
            url = url + "?sendorno=" + mobile + "";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", "Bearer " + token);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse Remitter_Register(string mobile, string name, string pincode, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Remitter_Register");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                mobile = mobile,
                name = name,
                surname = "Singh",
                pincode = pincode
            };
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_Delete(string beneficiaryid, string remitterid, string token, string SenderNumber)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Beneficiary_Delete");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                Sendernumber = SenderNumber,
                beneficiaryid = beneficiaryid,
                remitterid = remitterid
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_Delete_UPI(string idno, string token)
        {
            var url = "http://api.vastbazaar.com/api/COMPOSITE/delbenlist";
            url = url + "?idno=" + idno + "";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", "Bearer "+ token);
            IRestResponse response = client.Execute(request);
            return response;

            //var client = new RestClient(url);
            //var request = new RestRequest(Method.POST);
            //request.AddHeader("Authorization", "Bearer "+ token);
            //IRestResponse response = client.Execute(request);
            //return response;
        }
        public IRestResponse Beneficiary_Delete_wallet(string idno, string token)
        {
            var url = "http://api.vastbazaar.com/api/DMTPAYTM/delbenlist";
            url = url + "?idno=" + idno + "";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", "Bearer " + token);
            IRestResponse response = client.Execute(request);
            return response;

            //var client = new RestClient(url);
            //var request = new RestRequest(Method.POST);
            //request.AddHeader("Authorization", "Bearer "+ token);
            //IRestResponse response = client.Execute(request);
            //return response;
        }
        public IRestResponse Beneficiary_register_Validate(string beneficiaryid, string remitterid, string otp, string token, string sendernumber)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Remitter_Register_Validate");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                mobile = sendernumber,
                remitterid = remitterid,
                otp= otp,
                outletid=1
            };
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_Delete_Vaildate(string beneficiaryid, string remitterid, string otp, string token, string SenderNumber)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Beneficiary_Delete_Vaildate");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                SenderNumber = SenderNumber,
                beneficiaryid = beneficiaryid,
                remitterid = remitterid,
                otp = otp

            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_register(string remitterid, string name, string mobile, string ifsc, string account, string token, string ifscoriginal)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Beneficiary_register");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                remitterid = remitterid,
                name = name,
                mobile = mobile,
                ifsc = ifsc,
                account = account,
                originalifsc = ifscoriginal
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_register_UPI(string name, string mobile,  string account, string token)
        {
            var url = BaseURL + "/api/COMPOSITE/Benregister";
            url = url + "?senderno=" + mobile + "&upiid=" + account + "&benname=" + name + "";

            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", "bearer " + token);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_register_WALLET(string name, string mobile, string account, string token)
        {
            var url = BaseURL + "/api/DMTPAYTM/BenregisterNEW";
            url = url + "?senderno=" + mobile + "&walletid=" + account + "&benname=" + name + "";

            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", "bearer " + token);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse Beneficiary_register_resend_otp(string remitterid, string beneficiaryid, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Resend_otp");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                mobile = remitterid
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_Account_verify(string remittermobile, string account, string ifsc, string agentid, string token, string bnkname)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Beneficiary_Account_verify_new");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                remittermobile = remittermobile,
                account = account,
                ifsc = ifsc,
                Bankname = bnkname,
                agentid = agentid
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_Wallet_verify(string remittermobile, string account, string ifsc, string agentid, string token, string bnkname)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/PAYTMVALIDATE");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                remittermobile = remittermobile,
                account = account,
                ifsc = ifsc,
                Bankname = bnkname,
                agentid = agentid
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse Beneficiary_Account_verify_again(string remittermobile, string account, string ifsc, string agentid, string token, string bnkname)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Beneficiary_Account_verify_again");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                remittermobile = remittermobile,
                account = account,
                ifsc = ifsc,
                Bankname = bnkname,
                agentid = agentid
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse Beneficiary_Account_verify_Status(string remittermobile, string account, string ifsc, string agentid, string token, string bnkname)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Beneficiary_Account_Status_Verify");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                remittermobile = remittermobile,
                account = account,
                ifsc = ifsc,
                Bankname = bnkname,
                agentid = agentid
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse Fund_Transfer(string remittermobile, string benid, string agentid, string amount, string mode, string accountno, string ifsccode, string token, string bankname, string kyc, string aadharno)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Fund_Transfer");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                remittermobile = remittermobile,
                beneficiaryid = benid,
                agentid = agentid,
                amount = amount,
                mode = mode,
                accountno = accountno,
                bankname = bankname,
                kyccheck = kyc,
                aadharno = aadharno,
                ifsccode = ifsccode
            };
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Fund_Transfer_UPI(string remittermobile, string benid, string agentid, string amount, string mode, string accountno, string ifsccode, string token, string bankname, string kyc, string aadharno)
        {
            var url = BaseURL+ "/api/COMPOSITE/Payment";
            url = url + "?customervpa="+ accountno + "&amount="+ amount + "&senderno="+ remittermobile + "&agentid="+ agentid + "";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        //private const string RazorpayApiKey = "rzp_live_oPDljo7016F2We";
        //private const string RazorpayApiSecret = "tnmnU1Co4GQZXKYOmVYmr5JQ";
        public IRestResponse Fund_Transfer_Razor_UPI(string Acno, decimal? amt, string upi, string names, string Email, string mobile, string refid,string RazorpayApiKey,string RazorpayApiSecret,string accountnumber)
        {
            var client = new RestClient("https://api.razorpay.com/v1/payouts");
            var request = new RestRequest(Method.POST);
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("Authorization", "Basic " + Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{RazorpayApiKey}:{RazorpayApiSecret}")));

            // Prepare your payout request data as a C# object
            var payoutData = new
            {
                account_number = accountnumber,
                amount = amt * 100,
                currency = "INR",
                mode = "UPI",
                purpose = "payout",
                fund_account = new
                {
                    account_type = "vpa",
                    vpa = new
                    {
                        address = upi
                    },
                    contact = new
                    {
                        name = names,
                        email = Email,
                        contact = mobile,
                        type = "Retailer",
                        reference_id = refid,
                        notes = new
                        {
                            notes_key_1 = "dmt",
                            notes_key_2 = "dmt"
                        }
                    }
                },
                queue_if_low_balance = true,
                reference_id = refid,
                narration = "Payout Txn by UPI",
                notes = new
                {
                    notes_key_1 = "",
                    notes_key_2 = ""
                }
            };

            request.AddJsonBody(payoutData);

            IRestResponse response = client.Execute(request);
            return response;
        }
        public IRestResponse creaditFund_Transfer(string remittermobile, string benid, string agentid, string amount, string mode, string accountno, string ifsccode, string token, string bankname, string kyc, string aadharno)
        {
            var client = new RestClient(BaseURL + "/api/CREDITCARD/Fund_Transfer");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                remittermobile = remittermobile,
                beneficiaryid = benid,
                agentid = agentid,
                amount = amount,
                mode = "CREDITCARD",
                accountno = accountno,
                bankname = bankname,
                kyccheck = kyc,
                aadharno = aadharno,
                ifsccode = ifsccode
            };
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Beneficiary_Delete1(string beneficiaryid, string remitterid, string token, string SenderNumber)
        {
            var client = new RestClient(BaseURL + "/api/CREDITCARD/Beneficiary_Delete");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                Sendernumber = SenderNumber,
                beneficiaryid = beneficiaryid,
                remitterid = remitterid
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse Fund_Transfer_WALLET(string remittermobile, string benid, string agentid, string amount, string mode, string accountno, string ifsccode, string token, string bankname, string kyc, string aadharno)
        {
            var url = BaseURL + "/api/DMTPAYTM/WALLETTRANSFER";
            url = url + "?phone=" + accountno + "&amount=" + amount + "&senderno=" + remittermobile + "&agentid=" + agentid + "";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse Bank_details(string account, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMT1/Bank_details");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                account = account
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse EKOStatus(string t_id, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Transition_status");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                t_id = t_id
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse EKORefundResend(string t_id, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Refund_Resend");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                t_id = t_id
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse pancardnew(string token,string Title, string Gender, string Aadharno, string Name,DateTime DOB,string AadharregNumber, string Fathername, string Email, string Mobile)
        {
            var client = new RestClient(BaseURL + "/api/UTI/ManualRequest");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                Title= Title,
                Gender= Gender,
                Aadharno= Aadharno,
                Name= Name,
                DOB= DOB.ToString("yyyy-MM-dd"),
                AadharregNumber= AadharregNumber,
                Fathername= Fathername,
                Email= Email,
                Mobile= Mobile
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse EKORefund(string t_id, string otp, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMTPAYTM/Refund");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                t_id = t_id,
                otp = otp
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        public IRestResponse InstaStatus(string t_id, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMT1/Transition_status");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                t_id = t_id
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }

        public IRestResponse MposStatus(string message, string transType, string PartnerId, string token)
        {
            var client = new RestClient(BaseURL + "/api/DMT1/Bank_details");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token);
            request.AddHeader("content-type", "application/json");
            var data = new
            {
                Message = message,
                transType = transType,
                PartnerId = PartnerId
            };

            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(data);
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse responseall = client.Execute(request);
            return responseall;
        }
        #region ECO_DMT_CODE
        //public IRestResponse Remitter_details(string mobile, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Remitter_details");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        mobile = mobile
        //    };
        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Remitter_Register(string mobile, string name, string pincode, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Remitter_Register");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        mobile = mobile,
        //        name = name,
        //        pincode = pincode
        //    };
        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Beneficiary_Delete(string beneficiaryid, string remitterid, string token, string SenderNumber)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Beneficiary_Delete");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        Sendernumber = SenderNumber,
        //        beneficiaryid = beneficiaryid,
        //        remitterid = remitterid


        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Beneficiary_register_Validate(string beneficiaryid, string remitterid, string otp, string token, string sendernumber)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Verify_customer");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        Sendernumber = sendernumber,
        //        otp = otp
        //    };
        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Beneficiary_Delete_Vaildate(string beneficiaryid, string remitterid, string otp, string token, string SenderNumber)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Beneficiary_Delete_Vaildate");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        SenderNumber = SenderNumber,
        //        beneficiaryid = beneficiaryid,
        //        remitterid = remitterid,
        //        otp = otp

        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Beneficiary_register(string remitterid, string name, string mobile, string ifsc, string account, string token, string ifscoriginal)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Beneficiary_register");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        remitterid = remitterid,
        //        name = name,
        //        mobile = mobile,
        //        ifsc = ifsc,
        //        account = account,
        //        originalifsc = ifscoriginal
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Beneficiary_register_resend_otp(string remitterid, string beneficiaryid, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Resend_otp");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        mobile = remitterid
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Beneficiary_Account_verify(string remittermobile, string account, string ifsc, string agentid, string token, string bnkname)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Beneficiary_Account_verify");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        remittermobile = remittermobile,
        //        account = account,
        //        ifsc = ifsc,
        //        Bankname = bnkname,
        //        agentid = agentid
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Fund_Transfer(string remittermobile, string benid, string agentid, string amount, string mode, string accountno, string ifsccode, string token, string bankname, string kyc, string aadharno)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Fund_Transfer");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        remittermobile = remittermobile,
        //        beneficiaryid = benid,
        //        agentid = agentid,
        //        amount = amount,
        //        mode = mode,
        //        accountno = accountno,
        //        bankname = bankname,
        //        kyccheck = kyc,
        //        aadharno = aadharno,
        //        ifsccode = ifsccode
        //    };
        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse Bank_details(string account, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMT1/Bank_details");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        account = account
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse EKOStatus(string t_id, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Transition_status");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        t_id = t_id
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse EKORefundResend(string t_id, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Refund_Resend");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        t_id = t_id
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse EKORefund(string t_id, string otp, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMTECONEW/Refund");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        t_id = t_id,
        //        otp = otp
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}
        //public IRestResponse InstaStatus(string t_id, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMT1/Transition_status");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        t_id = t_id
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}

        //public IRestResponse MposStatus(string message, string transType, string PartnerId, string token)
        //{
        //    var client = new RestClient("http://api.vastbazaar.com/api/DMT1/Bank_details");
        //    var request = new RestRequest(Method.POST);
        //    request.AddHeader("authorization", "bearer " + token);
        //    request.AddHeader("content-type", "application/json");
        //    var data = new
        //    {
        //        Message = message,
        //        transType = transType,
        //        PartnerId = PartnerId
        //    };

        //    var serializer = new JavaScriptSerializer();
        //    var json = serializer.Serialize(data);
        //    request.AddParameter("application/json", json, ParameterType.RequestBody);
        //    IRestResponse responseall = client.Execute(request);
        //    return responseall;
        //}

        #endregion
    }
}