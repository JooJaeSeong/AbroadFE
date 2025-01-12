require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const { table, evaluation, forUniv, qna, free } = require('./db/database');
const { PORT } = process.env;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.json());
app.use(express.text());

app.listen(PORT, () => {
  console.log('Listening on 8080 Port💡');
});

app.get('/api/getKoUnivs', (req, res) => {
  table
    .find({}, (err, koUnivs) => {
      if (err) {
        res.end();
        return;
      }
      res.json(koUnivs);
    })
    .select('koUniv')
    .distinct('koUniv');
});

app.post('/api/getContinents', (req, res) => {
  const selectedKoUniv = req.body.selKoUniv;
  table
    .find({ koUniv: selectedKoUniv }, (err, tables) => {
      if (err) {
        res.end();
        return;
      }
      res.json(tables);
    })
    .select('continent')
    .distinct('continent');
});

app.post('/api/getCountries', (req, res) => {
  const postData = req.body;
  table
    .find(
      {
        koUniv: postData.selKoUniv,
        continent: { $in: postData.selContinent.split(',') },
      },
      (err, tables) => {
        if (err) {
          res.end();
          return;
        }
        res.json(tables);
      }
    )
    .select('country')
    .distinct('country');
});

app.post('/api/getTables', (req, res) => {
  const data = req.body;
  if (!data['continent'] && !data['country']) {
    table
      .find({ koUniv: data['koUniv'] }, (err, tables) => {
        if (err) {
          res.end();
          return;
        }
        res.json(tables);
      })
      .select('continent country forUniv_eng forUniv_kor TO period');
  } else if (data['continent'] && !data['country']) {
    table
      .find(
        {
          koUniv: data['koUniv'],
          continent: { $in: data['continent'] },
        },
        (err, tables) => {
          if (err) {
            res.end();
            return;
          }
          res.json(tables);
        }
      )
      .select('continent country forUniv_eng forUniv_kor TO period');
  } else {
    table
      .find(
        {
          koUniv: data['koUniv'],
          continent: { $in: data['continent'] },
          country: { $in: data['country'] },
        },
        (err, tables) => {
          if (err) {
            res.end();
            return;
          }
          res.json(tables);
        }
      )
      .select('continent country forUniv_eng forUniv_kor TO period');
  }
});

app.post('/api/getForUnivs', (req, res) => {
  const data = req.body;
  forUniv
    .find({ forUniv: data.title }, (err, images) => {
      if (err) {
        res.end();
        return;
      }
      res.json(images);
    })
    .select('image');
});

app.post('/api/getReviews', (req, res) => {
  const data = req.body;
  evaluation.find({ forUniv: data.forUniv }, (err, details) => {
    if (err) {
      res.end();
      return;
    }
    res.json(details);
  });
});

app.post('/api/getQna', (req, res) => {
  const num = req.body.page;
  qna
    .find({}, (err, qnas) => {
      if (err) {
        res.end();
        return;
      }
      res.json(qnas);
    })
    .skip((Number(num) - 1) * 15)
    .limit(Number(num) * 15);
});
app.post('/api/getFree', (req, res) => {
  const num = req.body.page;
  free
    .find({}, (err, frees) => {
      if (err) {
        res.end();
        return;
      }
      res.json(frees);
    })
    .skip((Number(num) - 1) * 15)
    .limit((Number(num) + 9) * 15);
});
app.post('/api/getFree/search', (req, res) => {
  const {
    body: { target, keyword },
  } = req;
  free.find({ title: { $regex: keyword } }, (err, frees) => {
    if (err) {
      res.end();
      return;
    }
    res.json(frees);
  });
});

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/public/index.html'));
// });
