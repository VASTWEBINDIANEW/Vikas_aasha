using Quartz;
using Quartz.Impl;
using System;
using static org.apache.commons.codec.language.bm.Rule;

namespace Vastwebmulti.Models.Scheduling
{
    public class SchedulerService
    {
        private static readonly string ScheduleCronExpression = "0 0 3 * * ?";
        private static readonly string ScheduleCronExpression1 = "0 */10 * ? * *";
      //  private static readonly string ScheduleCronExpression2 = "* * * ? * *";

        public static async System.Threading.Tasks.Task StartAsync()
        {
            try
            {
                var scheduler = await StdSchedulerFactory.GetDefaultScheduler();
                if (!scheduler.IsStarted)
                {
                    await scheduler.Start();
                }
                var job1 = JobBuilder.Create<Task_Delete_data>()
                    .WithIdentity("ExecuteTaskServiceCallJob1", "group1")
                    .Build();
                var trigger1 = TriggerBuilder.Create()
                    .WithIdentity("ExecuteTaskServiceCallTrigger1", "group1")
                    .WithCronSchedule(ScheduleCronExpression)
                    .Build();

                await scheduler.ScheduleJob(job1, trigger1);

                var job2 = JobBuilder.Create<Task_Delete_data>()
                   .WithIdentity("ExecuteTaskServiceCallJob2", "group2")
                   .Build();
                var trigger2 = TriggerBuilder.Create()
                    .WithIdentity("ExecuteTaskServiceCallTrigger2", "group2")
                    .WithCronSchedule(ScheduleCronExpression)
                    .Build();
                await scheduler.ScheduleJob(job2, trigger2);

                var job3 = JobBuilder.Create<Phonepe>()
      .WithIdentity("ExecuteTaskServiceCallJob3", "group3")
      .Build();
                var trigger3 = TriggerBuilder.Create()
                    .WithIdentity("ExecuteTaskServiceCallTrigger3", "group3")
                    .WithCronSchedule(ScheduleCronExpression1)
                    .Build();

                await scheduler.ScheduleJob(job3, trigger3);

                //var job4 = JobBuilder.Create<Radaint>()
                //           .WithIdentity("ExecuteTaskServiceCallJob4", "group4")
                //           .Build();
                //var trigger4 = TriggerBuilder.Create()
                //    .WithIdentity("ExecuteTaskServiceCallTrigger4", "group4")
                //    .WithCronSchedule(ScheduleCronExpression2)
                //    .Build();

                //await scheduler.ScheduleJob(job4, trigger4);

            }
            catch (Exception ex)
            {
            }
        }
    }
}