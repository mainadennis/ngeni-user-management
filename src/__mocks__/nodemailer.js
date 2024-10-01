module.exports = {
  createTransport: () => {
    return {
      sendMail: jest.fn().mockResolvedValue({
        accepted: ["test@example.com"],
        rejected: [],
        response: "250 OK: queued",
      }),
    };
  },
};
