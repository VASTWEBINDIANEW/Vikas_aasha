using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Vastwebmulti.Models
{
    public class ExternalLoginConfirmationViewModel
    {
        [Required]
        [Display(Name = "Email")]
        public string Email { get; set; }
    }

    public class ExternalLoginListViewModel
    {
        public string ReturnUrl { get; set; }
    }

    public class SendCodeViewModel
    {
        public string SelectedProvider { get; set; }
        public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
        public string ReturnUrl { get; set; }
        public bool RememberMe { get; set; }
    }

    public class VerifyCodeViewModel
    {
        [Required]
        public string Provider { get; set; }

        [Required]
        [Display(Name = "Code")]
        public string Code { get; set; }
        public string ReturnUrl { get; set; }

        [Display(Name = "Remember this browser?")]
        public bool RememberBrowser { get; set; }

        public bool RememberMe { get; set; }
    }

    public class ForgotViewModel
    {
        [Required]
        [Display(Name = "Email")]
        public string Email { get; set; }
    }

    public class LoginViewModel
    {
        [Required]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [Display(Name = "Remember me?")]
        public bool RememberMe { get; set; }
    }

    public class RegisterViewModel
    {
        public int Email_Id { get; set; }
        public int Mobile_Id { get; set; }

        [Required(ErrorMessage = "The email address is required")]

        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "The email address is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        [Display(Name = "Email")]
        public string SupportMail { get; set; }

        [Required(ErrorMessage = "The User Id is required.")]
        public string USERCHECK { get; set; }

        [Required(ErrorMessage = "The Password is required.")]
        [StringLength(100, ErrorMessage = "The Password is required.")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }


        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [RegularExpression("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z])(.{8,15})$", ErrorMessage = "Password must contain atleast 1 number, 1 letter, and 1 special character. (MAX Length 6) ")]
        [DataType(DataType.Password)]
        [Display(Name = "Passwordnew")]
        public string Passwordnew { get; set; }
        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
        [Required(ErrorMessage = "Enter The Mobile Number")]
        [Display(Name = "Home Phone")]
        [DataType(DataType.PhoneNumber)]
        [RegularExpression(@"^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$", ErrorMessage = "Not a valid Phone number")]
        [MaxLength(10, ErrorMessage = "Mobile No cannot be longer than 10 Digit.")]
        public string Mobile { get; set; }
        [Required(ErrorMessage = "Enter The Name")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Select Any Distributor")]
        public string Distributorid { get; set; }
        [Display(Name = "Remember me?")]
        public bool RememberMe { get; set; }
        public string customercareno { set; get; }
        [Required(ErrorMessage = "Enter GST No")]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 12)]
        public string GstNo { set; get; }
        [Required(ErrorMessage = "Enter Pan Card No")]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 12)]
        public string pancardno { set; get; }
        [Required(ErrorMessage = "Enter Aadhar No")]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 12)]
        public string aadharNo { set; get; }
        [Required(ErrorMessage = "Enter Address")]
        public string Address { set; get; }
        [Required(ErrorMessage = "Enter Website Url")]
        public string WebsiteUrl { set; get; }
        [Required(ErrorMessage = "Select Any State")]
        public string state { set; get; }
        [Required(ErrorMessage = "Select Any District")]
        public string distict { set; get; }
        [Required(ErrorMessage = "Enter Admin Value")]
        public string Value { set; get; }
        public string referralcode { get; set; }
        [RegularExpression(@"^[0-9]{1,7}$", ErrorMessage = "Please Enter Valid Pin Code.")]
        public int Pin { get; set; }
        public string Companyname { set; get; }
    }

    public class ResetPasswordViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [RegularExpression("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\]*+\\/|!\"£@$%^&*()#[@~'?><,.=_-]).{6,}$", ErrorMessage = "iNVALID fORMATE.")]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }

        public string Code { get; set; }
    }

    public class ForgotPasswordViewModel
    {
        [Required]

        [Display(Name = "Email")]
        public string Email { get; set; }
    }


}
