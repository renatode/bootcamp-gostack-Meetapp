import { format, parseISO } from 'date-fns';
import Mail from '../../Lib/Mail';

class NewSubscriptionMail {
  get key() {
    return 'NewSubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    try {
      await Mail.sendMail({
        to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
        subject: 'Seu MeetUp recebeu uma nova inscricao',
        template: 'newSubscription',
        context: {
          organizerName: meetup.organizer.name,
          meetupName: meetup.title,
          meetupDate: format(parseISO(meetup.date), "dd/MM/yyyy 'as' HH:mm"),
          subscriberName: user.name,
          subscriberMail: user.email,
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('newSubscription SendMail Error ==> ', e);
    }
  }
}

export default new NewSubscriptionMail();
