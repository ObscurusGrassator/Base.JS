/**
 * @template UserData
 * @typedef {{send: function(UserData): void,
 *   listen: function(function(Event, UserData): void): {removeListen: function(): void}}} EventType
 */
export {}
