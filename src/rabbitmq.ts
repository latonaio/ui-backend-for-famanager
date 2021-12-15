import { RabbitmqClient } from 'rabbitmq-client';

export const QUEUE_TO_TEMPLATE_1 = process.env.QUEUE_TO_TEMPLATE_1;
export const QUEUE_TO_TEMPLATE_2 = process.env.QUEUE_TO_TEMPLATE_2;

let rabbitmqClient: RabbitmqClient = null;

export const getRabbitmqClient = async () => {
  if (rabbitmqClient) {
    return rabbitmqClient;
  }

  rabbitmqClient = await RabbitmqClient.create(
    process.env.RABBITMQ_URL,
    [],
    [QUEUE_TO_TEMPLATE_1, QUEUE_TO_TEMPLATE_2]
  );
  return rabbitmqClient;
};
