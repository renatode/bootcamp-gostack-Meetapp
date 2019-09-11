import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import Meetup from '../Models/Meetup';
import File from '../Models/File';
import User from '../Models/User';

class Meetupcontroller {
  async index(req, res) {
    const { date, page = 1 } = req.query;
    const where = {};

    if (date) {
      const pdate = parseISO(date);
      where.date = { [Op.between]: [startOfDay(pdate), endOfDay(pdate)] };
    }

    const meetupsList = await Meetup.findAll({
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
      limit: 10,
      where,
      order: ['date'],
      offset: (page - 1) * 10,
      include: [
        { model: File, as: 'banner', attributes: ['id', 'path', 'url'] },
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.json(meetupsList);
  }

  async show(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Meetup id must be provided' });
    }

    const meetup = await Meetup.findOne({ where: { id } });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup id does not exists' });
    }

    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Data Validation failed' });
    }

    const { title, description, location, date, banner_id } = req.body;

    const parsedDate = parseISO(date);
    const past = isBefore(parsedDate, new Date());
    if (past) {
      return res.status(400).json({ error: 'Past Dates are not permitted!' });
    }

    const alreadyCreated = await Meetup.findOne({
      where: { user_id: req.userId, date: parsedDate },
    });
    if (alreadyCreated) {
      return res.status(400).json({ error: 'Meet already created!' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const { id } = req.params;
    const meetup = await Meetup.findOne({ where: { id } });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup id does not exists' });
    }

    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Data Validation failed' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Permission denied' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Meetup is at the past and can not be changed' });
    }

    const newMeetup = await meetup.update(req.body);

    return res.json(newMeetup);
  }

  async delete(req, res) {
    const { id } = req.params;
    const meetup = await Meetup.findOne({ where: { id } });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup id does not exists' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Permission denied' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Meetup is at the past and can not be deleted' });
    }

    await meetup.destroy();

    return res.json({ message: 'success' });
  }
}

export default new Meetupcontroller();
