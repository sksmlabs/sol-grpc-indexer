const mode = process.env.MODE;

switch (mode) {
  case "producer":
    require("./workers/producer");
    break;
  case "consumer":
    require("./workers/consumer");
    break;
  default:
    console.error("Unknown MODE:", mode);
    process.exit(1);
}
