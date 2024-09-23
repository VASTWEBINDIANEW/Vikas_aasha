using RestSharp;
using sun.misc;
using Vastwebmulti.Models;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class Vastbillpay
    {
        string VastbazaarBaseUrl = "http://api.vastbazaar.com/";
        public IRestResponse billpay(string token,string mobileno,string apioptcode,string Amount,string optional1,string optional2,string CommonTranid)
        {
            var client = new RestClient(VastbazaarBaseUrl+"api/Electricity/Pay");
         
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token + "");
            request.AddHeader("content-type", "application/json");
            request.AddParameter("application/json", "{\r\n  \"Number\": \"" + mobileno + "\",\r\n  \"Operatorcode\":\"" + apioptcode + "\",\r\n  \"amount\":\"" + Amount + "\",\r\n  \"Account\":\"" + optional1 + "\",\r\n  \"optional1\":\"" + optional2 + "\",\r\n  \"RchId\":\"" + CommonTranid + "\",\r\n  \"Viewbill\":\"N\"\r\n}", ParameterType.RequestBody);
            IRestResponse responsecheck = client.Execute(request);
            return responsecheck;
        }
        public IRestResponse Viewbill(string token, string mobileno, string apioptcode, string Amount, string optional1, string optional2, string CommonTranid)
        {
       
            var client = new RestClient(VastbazaarBaseUrl+"api/Electricity/Pay");
         
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token + "");
            request.AddHeader("content-type", "application/json");
            request.AddParameter("application/json", "{\r\n  \"Number\": \"" + mobileno + "\",\r\n  \"Operatorcode\":\"" + apioptcode + "\",\r\n  \"amount\":\"" + Amount + "\",\r\n  \"Account\":\"" + optional1 + "\",\r\n  \"optional1\":\"" + optional2 + "\",\r\n  \"RchId\":\"" + CommonTranid + "\",\r\n  \"Viewbill\":\"Y\"\r\n}", ParameterType.RequestBody);
            IRestResponse responsecheck = client.Execute(request);
            return responsecheck;
        }
        public IRestResponse WalletUnloadrRquest(string token, string Email, decimal Amount, string comment, string AccountNo, string Bankname,string Ifsccode,string Accountholdername,string RequestId,string Type)
        {
            var client = new RestClient(VastbazaarBaseUrl + "api/Unload/WalletUnloaduserNew");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token + "");
            request.AddHeader("content-type", "application/json");
            request.AddParameter("application/json", "{\r\n  \"customerid\": \"" + Email + "\",\r\n  \"amount\":\"" + Amount + "\",\r\n  \"comment\":\"" + comment + "\",\r\n  \"customeraccountno\":\"" + AccountNo.Trim() + "\",\r\n  \"Type\":\"" + Type + "\",\r\n  \"customerbankname\":\"" + Bankname.Trim() + "\",\r\n  \"customerifsccode\":\"" + Ifsccode.Trim() + "\",\r\n  \"accountholdername\":\"" + Accountholdername.Trim() + "\",\r\n  \"Reqid\":\"" + RequestId + "\",\r\n}", ParameterType.RequestBody);
            IRestResponse responsecheck = client.Execute(request);
            return responsecheck;
        }
        public IRestResponse CreditCard(string token, string RetailerId, string Frm_Name, string Mobile, decimal Amount, string EnCardNumber, string EnCVV, string EnExp, string Otp, string RequestId)
        {
            var client = new RestClient(VastbazaarBaseUrl + "api/CREDITCARD/CSC_Credit_card_addmoney");
            var request = new RestRequest(Method.POST);
            request.AddHeader("authorization", "bearer " + token + "");
            request.AddHeader("content-type", "application/json");
            request.AddParameter("application/json", "{\r\n  \"Retailerid\": \"" + RetailerId + "\",\r\n  \"Retailername\":\"" + Frm_Name + "\",\r\n  \"Mobile\":\"" + Mobile + "\",\r\n  \"Amount\":\"" + Amount + "\",\r\n  \"Cardnumber\":\"" + EnCardNumber + "\",\r\n  \"CVV\":\"" + EnCVV + "\",\r\n  \"Exp\":\"" + EnExp + "\",\r\n  \"OTP\":\"" + Otp + "\",\r\n  \"Reqid\":\"" + RequestId + "\",\r\n}", ParameterType.RequestBody);
            IRestResponse responsecheck = client.Execute(request);
            return responsecheck;
        }
    }
}