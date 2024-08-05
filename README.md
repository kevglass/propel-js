<img src="https://github.com/kevglass/propel-js/raw/main/logo.png" width="200">

# propel-js - Tiny Open Physics Library.

A free, open source, teeny weeny physics library for typescript. Mostly just some utilities for making games.

[Documentation](https://kevglass.github.io/propel-js/docs)

[Examples](https://kevglass.github.io/propel-js/examples/)

## Why?

When working with networked physics games it's useful to be able to seralize state to send across the wire. Other physics
engines do this by providing a seralizer but doing this regularly can be expensive. propel-js aims to keep physics state
in serializable structures with functions/resolvers outside of the data.

## Features

* Rectangles
* Circles
* Joints
* Compound Bodies
* Sensors

More added as time permits.

## Dusk Compatible

This was built to support physics in networked games on the [Dusk Platform](https://developers.dusk.gg)

## Credits

* This project started as a port and clean up of: https://github.com/xem/mini2Dphysics/tree/gh-pages
* Bjarke Felbo also contributed to the original source: https://github.com/bfelbo