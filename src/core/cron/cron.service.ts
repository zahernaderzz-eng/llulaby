import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class CronService implements OnModuleInit {
    constructor(private schedulerRegistry: SchedulerRegistry) {}

    onModuleInit() {
        // initialize jobs here
    }

    addJob(id: string, cronTime: string, callback: () => void) {
        if (this.schedulerRegistry.doesExist('cron', id)) {
            console.log(`🤖 Job ${id} already exists`);
            return;
        }

        const job = new CronJob(cronTime, callback);
        this.schedulerRegistry.addCronJob(id, job);
        job.start();

        console.log(`✅ Scheduled job ${id} with cron: ${cronTime}`);
    }

    async stopJob(id: string) {
        const job = this.schedulerRegistry.getCronJob(id);
        await job?.stop();
        console.log(`⏸️ Stopped job ${id}`);
    }

    deleteJob(id: string) {
        this.schedulerRegistry.deleteCronJob(id);
        console.log(`🗑️ Deleted job ${id}`);
    }

    listJobs(): Map<string, CronJob> {
        return this.schedulerRegistry.getCronJobs();
    }
}
