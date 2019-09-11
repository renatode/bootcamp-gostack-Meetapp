import 'dotenv/config';
import Bee from 'bee-queue';
import NewSubscriptionMail from '../App/Jobs/NewSubscriptionMail';
import redisConfig from '../Config/redis';

const jobs = [NewSubscriptionMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.error(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
