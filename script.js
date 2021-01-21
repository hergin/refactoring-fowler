function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays));
}

function createStatementData(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return statementData;

  function totalVolumeCredits(data) {
    let result = 0;
    for (let perf of data.performances) {
      // add volume credits
      result += perf.volumeCredits;
    }
    return result;
  }

  function totalAmount(data) {
    let result = 0;
    for (let perf of data.performances) {
      result += perf.amount;
    }
    return result;
  }

  function enrichPerformance(aPerformance) {
    const result = Object.assign({},aPerformance); // copy
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  function volumeCreditsFor(perf) {
    let result = 0;
    result += Math.max(perf.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ("comedy" === perf.play.type)
      result += Math.floor(perf.audience / 5);
    return result;
  }

  function playFor(perf) {
    return plays[perf.playID];
  }

  function amountFor(aPerformance) {
    let result = 0;

    switch (aPerformance.play.type) {
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`unknown type: ${aPerformance.play.type}`);
    }
    return result;
  }
}

function renderPlainText(data) {
  let result = `Statement for ${data.customer}\n`;
    
  for (let perf of data.performances) {
    // print line for this order
    result += `  ${perf.play.name}: ${usd(perf.amount)} (${
      perf.audience
    } seats)\n`;
  }

  result += `Amount owed is ${usd(data.totalAmount)}\n`;

  result += `You earned ${data.totalVolumeCredits} credits\n`;

  return result;

  function usd(aNumber) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(aNumber/100);
  }

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