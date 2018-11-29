
const fs = require('fs');
const csv = fs.createWriteStream("cloudwatch.csv", {flags: 'w'});

const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});  // why do I need to do this?
const cloudwatchlogs = new AWS.CloudWatchLogs();

const memorySizes = {
    256:    0.000000417,
    512:    0.000000834,
    768:    0.000001250, 
    1024:   0.000001667,
    1536:   0.000002501,
    2048:   0.000003334
};

let params = {
    logGroupName: '/aws/lambda/aws-dev-screenshot', /* required */
    filterPattern: 'Billed'
};

cloudwatchlogs.filterLogEvents(params, function(err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        // console.log(data);

        csv.write("timestamp,duration,billed_duration,memory_size,max_memory_used,cost\n");
        data['events'].forEach(e => {
            const ts = e['timestamp'];
            const message = e['message'];

            // console.log(e);
            const split = message.split("\t")
            const duration = split[1].replace(/duration:|ms/gi, "").trim();
            const billed_duration = split[2].replace(/billed duration:|ms/gi, "").trim();
            const memory_size = split[3].replace(/memory size:|mb/gi, "").trim();
            const max_memory_used = split[4].replace(/max memory used:|mb/gi, "").trim();
            const cost = memorySizes[memory_size] * (duration / 100)

            csv.write(`${ts},${duration},${billed_duration},${memory_size},${max_memory_used},${cost}\n`);
        });

        csv.close();
    }
});
