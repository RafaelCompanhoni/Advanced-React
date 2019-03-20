const Mutations = {
    async createItem(parent, args, ctx, info) {
        // TODO: check if they are logged in

        const item = await ctx.db.mutation.createItem({
            data: {
                ...args
            },
        }, info);

        console.log(item);

        return item;
    },
    async updateItem(parent, args, ctx, info) {
        // remove the id fom the item to be updated
        const updates = { ...args };
        delete updates.id;

        // the Prisma 'updateItem' receives the item to be updated and the 'where' clause to determine which item. Info is the query from the client-side, needed by Prisma
        return ctx.db.mutation.updateItem({
            data: updates,
            where: { id: args.id }
        }, info)
    }
};

module.exports = Mutations;
