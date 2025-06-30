const { CloudTasksClient } = require("@google-cloud/tasks");
const client = new CloudTasksClient();

exports.onGcsUpload = async (event) => {
    const data = JSON.parse(Buffer.from(event.data, "base64").toString());
    const { bucket, name } = data;

    const project = process.env.GCP_PROJECT;
    const location = process.env.TASKS_REGION || "asia-southeast1";
    const queue = process.env.TASKS_QUEUE || "gcs-event-queue";
    const url = process.env.TARGET_API_URL; 

    const parent = client.queuePath(project, location, queue);

    const task = {
        httpRequest: {
            httpMethod: "POST",
            url,
            headers: { "Content-Type": "application/json" },
            body: Buffer.from(JSON.stringify({ bucket, key: name })).toString(
                "base64"
            ),
        },
    };

    try {
        const [response] = await client.createTask({ parent, task });
        console.log(`Task created: ${response.name}`);
    } catch (err) {
        console.error("Failed to create task:", err);
        throw err;
    }
};
