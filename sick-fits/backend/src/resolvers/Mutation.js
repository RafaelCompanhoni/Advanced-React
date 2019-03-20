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
  }
};

module.exports = Mutations;
