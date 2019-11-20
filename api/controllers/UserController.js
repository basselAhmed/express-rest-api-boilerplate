// const User = require('../models/User');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const uuidv4 = require('uuid/v4');
const generate = require('project-name-generator');

const total = 100;

const user = {
  id: '602ed20d9c06dfd49e000000',
  email: 'frontend@ninja.com',
  name: 'Frontend Ninja',
  avatar: 'https://i.pravatar.cc/100',
  plan: 'premium',
  totalApps: total,
  totalDevices: 3920,
};

const appsArr = new Array(total).fill({}).map(() => ({
  id: uuidv4(),
  title: generate({ words: 3 }).spaced,
  icon: 'https://picsum.photos/50/50',
  totalUsers: Math.round(Math.random() * 100000),
  platforms: {
    ios: true,
    android: true,
    chrome: true,
    firefox: true,
    opera: true,
    safari: true,
  },
  chartData: [
    {
      label: '2019-11-13',
      value: Math.round(Math.random() * 1000),
    },
    {
      label: '2019-11-14',
      value: Math.round(Math.random() * 1000),
    },
    {
      label: '2019-11-15',
      value: Math.round(Math.random() * 1000),
    },
    {
      label: '2019-11-16',
      value: Math.round(Math.random() * 1000),
    },
    {
      label: '2019-11-17',
      value: Math.round(Math.random() * 1000),
    },
    {
      label: '2019-11-18',
      value: Math.round(Math.random() * 1000),
    },
    {
      label: '2019-11-19',
      value: Math.round(Math.random() * 1000),
    },
    {
      label: '2019-11-20',
      value: Math.round(Math.random() * 1000),
    },
  ],
}));

const apps = {
  total,
  data: appsArr,
};

const UserController = () => {
  const login = async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
      try {
        const userPassword = bcryptService().password({ password: '12345' });
        const passwordCorrect = bcryptService().comparePassword(
          password,
          userPassword,
        );

        if (email === 'frontend@ninja.com' && passwordCorrect) {
          const token = authService().issue({ id: user.id });
          return res.status(200).json({ token, user });
        }

        return res.status(401).json({ msg: 'Unauthorized' });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Email or password is wrong' });
  };

  const me = async (req, res) => {
    try {
      return res.status(200).json({ ...user });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };

  const getApps = async (req, res) => {
    const {
      take, skip, sortBy, direction,
    } = req.query;
    try {
      if (!take || !skip) {
        return res
          .status(400)
          .json({ msg: 'Bad request, you must specify pagination params' });
      }
      if (direction && direction !== 'asc' && direction !== 'desc') {
        return res.status(400).json({ msg: 'Not a valid direction' });
      }
      if (sortBy && !Object.keys(apps.data[0]).includes(sortBy)) {
        return res.status(400).json({ msg: 'Not a valid sortBy' });
      }
      if (Number(take) < 0 || Number(skip) < 0) {
        return res
          .status(400)
          .json({ msg: 'Bad request, not a valid pagination params' });
      }
      if (
        Number(take) >= apps.data.length ||
        Number(skip) >= apps.data.length
      ) {
        return res.status(200).json({ total: apps.total, data: apps.data });
      }
      const arr = apps.data.slice(Number(skip), Number(skip) + Number(take));
      if (sortBy && direction) {
        arr.sort((a, b) => {
          if (direction === 'asc') {
            if (a[sortBy] < b[sortBy]) {
              return -1;
            }
            if (b[sortBy] < a[sortBy]) {
              return 1;
            }
            return 0;
          }
          if (a > b) {
            return -1;
          }
          if (b[sortBy] > a[sortBy]) {
            return 1;
          }
          return 0;
        });
      }
      return res.status(200).json({ total: apps.total, data: arr });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };

  return {
    login,
    me,
    getApps,
  };
};

module.exports = UserController;
