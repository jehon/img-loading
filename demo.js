
import Express from 'express'

const express = new Express();

express.use('/waiting', (req, res, next) => {
    setTimeout(() => next(), 1000);
});

express.use(Express.static('demo'));
express.use('/waiting', Express.static('demo'));

express.listen(8080);
