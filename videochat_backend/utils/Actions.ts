export enum ACTIONS {
    JOIN_ROOM = 'join_room',
    GET_PRODUCERS = 'get_producers',
    NEW_PRODUCER_CREATED = 'new_producer_created',
    CREATE_TRANSPORT = 'create_transport',
    GET_USERS = 'get_users',
    SEND_TRANSPORT_CREATED = 'transport_created',
    RECEIVE_TRANSPORT_CREATED = 'receive_transport_created',
    ROUTER_RTP_CAPABILITIES = 'router_rtp_capabilities',
    SEND_TRANSPORT_CONNECT = 'send_transport_connect',
    CONSUME_TRANSPORT_CONNECT = 'receive_transport_connect',
    NEW_CHAT_MESSAGE = 'chat_message',
    BROADCAST_CHAT_MESSAGE = 'broadcast_chat_message',
    CONSUME = 'consume',
    TRANSPORT_PRODUCE = 'transport_produce',
    TRANSPORT_CONSUME = 'transport_consume',
    DISCONNECT_PRODUCERS = 'disconnect_producers',
    DELETE_STREAM = 'delete_stream',
    CONSUMER_RESUME = 'consumer-resume',
    SOCKET_DISCONNECTED = 'socket_disconnected',
    DISCONNECTING = 'disconnecting',
    ERROR = 'error'
}