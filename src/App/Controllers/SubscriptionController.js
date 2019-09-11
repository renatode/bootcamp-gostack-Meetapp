import { Op } from 'sequelize';

import Subscription from '../Models/Subscription';
import Meetup from '../Models/Meetup';
import User from '../Models/User';

import NewSubscriptionMail from '../Jobs/NewSubscriptionMail';
import Queue from '../../Lib/Queue';

class SubscriptionController {
  async index(req, res) {
    const userOpenSubscriptions = await Subscription.findAll({
      attributes: [],
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          attributes: [
            'id',
            'title',
            'description',
            'location',
            'date',
            'past',
          ],
          where: {
            date: { [Op.gt]: new Date() },
          },
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['meetup', 'date']],
    });
    return res.json(userOpenSubscriptions);
  }

  async store(req, res) {
    const { id: meetupId } = req.params;
    const user = await User.findByPk(req.userId);

    if (!meetupId) {
      return res.status(400).json({ error: 'Data Validation failed' });
    }

    const meetup = await Meetup.findByPk(meetupId, {
      include: [{ model: User, as: 'organizer' }],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists!' });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: 'Can not subscribe to you own meetups!' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'Past Dates are not permitted!' });
    }

    const userSubscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [{ model: Meetup, as: 'meetup', where: { date: meetup.date } }],
    });
    if (userSubscriptions.length > 0) {
      const alreadySubscribed = userSubscriptions.filter(
        s => s.meetup_id === Number(meetupId)
      );
      if (alreadySubscribed.length > 0) {
        return res.status(400).json({ error: 'Already Subscribed!' });
      }
      return res
        .status(400)
        .json({ error: 'Can not subscribe to two meetups at the same time' });
    }

    const subscription = await Subscription.create({
      meetup_id: meetupId,
      user_id: req.userId,
    });

    await Queue.add(NewSubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
