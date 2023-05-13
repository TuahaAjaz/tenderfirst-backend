exports.generateCode = async (model, prefix) => {
    const codes = await model
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .select("-_id code");
    let counter = 0;
    if (codes.length > 0) {
      counter = parseInt(codes[0].code.slice(prefix.length));
    }
    return `${prefix}${counter + 1}`;
};