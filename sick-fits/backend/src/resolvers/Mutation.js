const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    );

    console.log(item);

    return item;
  },
  async updateItem(parent, args, ctx, info) {
    // remove the id fom the item to be updated
    const updates = { ...args };
    delete updates.id;

    // the Prisma 'updateItem' receives the item to be updated and the 'where' clause to determine which item. Info is the query from the client-side, needed by Prisma
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };

    // find the item
    const item = await ctx.db.query.item({ where }, `{ id, title }`);

    // check if they own the item or have the permissions
    // TODO

    // delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // lowercase the email
    args.email = args.email.toLowerCase();

    // hash the password (10 is the random salt length)
    const password = await bcrypt.hash(args.password, 10);

    // create the user in the database
    const user = await ctx.db.mutation.createUser({
      data:  {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }
    }, info)

    // create the JWT token (so the user doesn't need to sign in after signing up)
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set JWT as a cookie on the response (from now on it will come with every subsequent request)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year 
    });

    // return user obj to the client
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email }});
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    // check if the password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password');
    }

    // generate the JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  async signout(parent, { email, password }, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Logged out' }
  },
  async requestReset(parent, args, ctx, info) {
    // check if it's a real user
    const user = await ctx.db.query.user({ where: { email: args.email }});
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    // set a reset token and expiry date
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // reset token expires in 1 hour from now


    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    console.log(res);
    return { messsage: 'THANKS!' }

    // email the user the reset token
    // TODO
  },
  async resetPassword(parent, args, ctx, info) {
    // check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("The informed passwords don't match")
    }

    // check if it's a legit reset token and it's not expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if(!user) {
      throw new Error('This token is is either invalid or expired');
    }

    // hash the new password and update the user with it
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({ 
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    console.log('UPDATED USER')

    // generate the JWT token and set the cookie with it
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    return updatedUser;
  }
};

module.exports = Mutations;
