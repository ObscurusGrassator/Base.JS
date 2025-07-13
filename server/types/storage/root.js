/**
 * @typedef { Object } Type
 * @property {{
 *      reqID: number,
 *      speak?: string, speakDisable?: boolean,
 *      listen?: boolean, getAccept?: boolean,
 *      name?: string,
 *      resolve: function, reject: function,
 * } | false} sendDataToClient
 * @property { number } requestID
 * @property { boolean } speakDisable
 * @property { (result: string) => void } waitingToPromptAnswer
 * @property { string } appStorage
 * @property { string } appStoragePlugins
 * @property { string } appStorageLocalPlugins
 * @property { string } appStorageCodeCache
 */
export {}
