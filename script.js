function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case "comedy":
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`unknown type: ${play.type}`);
    }

    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

    // print line for this order
    result += `  ${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    } seats)\n`;
    totalAmount += thisAmount;
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}

var invoices = [
  {
    customer: "BigCo",
    performances: [
      {
        playID: "hamlet",
        audience: 55
      },
      {
        playID: "as-like",
        audience: 35
      },
      {
        playID: "othello",
        audience: 40
      }
    ]
  },
  {
    customer: "SmallCo",
    performances: [
      {
        playID: "hamlet",
        audience: 10
      },
      {
        playID: "othello",
        audience: 5
      }
    ]
  }
];

var plays = {
  "hamlet": { name: "Hamlet", type: "tragedy" },
  "as-like": { name: "As You Like It", type: "comedy" },
  "othello": { name: "Othello", type: "tragedy" }
};

document.write(statement(invoices[0],plays));

// Tests
mocha.setup("bdd");
var assert = chai.assert;

describe("Refactoring", function() {
  it("has provided plays to BigCo", function() {
    var expected =
      "Statement for BigCo\n" +
      "  Hamlet: $650.00 (55 seats)\n" +
      "  As You Like It: $580.00 (35 seats)\n" +
      "  Othello: $500.00 (40 seats)\n" +
      "Amount owed is $1,730.00\n" +
      "You earned 47 credits\n";
    var actual = statement(invoices[0], plays);
    assert.equal(expected, actual);
  });

  it("has provided plays to SmallCo", function() {
    var expected =
      "Statement for SmallCo\n" +
      "  Hamlet: $400.00 (10 seats)\n" +
      "  Othello: $400.00 (5 seats)\n" +
      "Amount owed is $800.00\n" +
      "You earned 0 credits\n";
    var actual = statement(invoices[1], plays);
    assert.equal(expected, actual);
  });
});

mocha.run();