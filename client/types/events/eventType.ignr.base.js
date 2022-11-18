/**
 * @template UserData
 * @typedef {{
 * 		send: (userData: UserData) => void,
 *   	listen: (callback: (userData: UserData, event: Event) => void) => {removeListen: function(): void}
 * }} EventType
 */
export {}
