using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class MinimumAgeAttribute : ValidationAttribute, IClientValidatable
    {
        private readonly int _minimumAge;

        public MinimumAgeAttribute(int minimumAge)
        {
            _minimumAge = minimumAge;
            ErrorMessage = string.Format("You must be at least {0} years old", minimumAge);
        }

        public override bool IsValid(object value)
        {
            if (value == null) return true; // let [Required] handle null-checking separately

            if (!(value is DateTime)) return false;

            DateTime dob = (DateTime)value;
            var today = DateTime.Today;
            var age = today.Year - dob.Year;
            if (dob.Date > today.AddYears(-age)) age--;
            return age >= _minimumAge;
        }

        public IEnumerable<ModelClientValidationRule> GetClientValidationRules(ModelMetadata metadata, ControllerContext context)
        {
            var rule = new ModelClientValidationRule
            {
                ValidationType = "minimumage",
                ErrorMessage = ErrorMessageString
            };
            rule.ValidationParameters.Add("min", _minimumAge);
            yield return rule;
        }
    }
}