import { registerAppEvent } from "../../private/playbackLoader.js";
import { genCombine } from "@proxtx/combine-rest/request.js";
import { genModule } from "@proxtx/combine/combine.js";

export class App {
  updateCheckInterval = 1 * 60 * 1000;
  lastNotes;

  constructor(config) {
    this.config = config;
    (async () => {
      this.notesApi = await genCombine(
        this.config.apiUrl,
        "public/notes.js",
        genModule
      );

      this.mainUrl = new URL(this.config.apiUrl);
      this.mainUrl.pathname = "/";
      this.mainUrl = this.mainUrl.href;

      while (true) {
        (async () => {
          try {
            await this.checkForNewNotes();
          } catch (e) {
            console.log(e);
          }
        })();
        await new Promise((r) => setTimeout(r, this.updateCheckInterval));
      }
    })();
  }

  async checkForNewNotes() {
    let notes = await this.notesApi.getNotes(this.config.pwd);
    if (notes != this.lastNotes && notes.trim() != "")
      registerAppEvent({
        app: "Notes",
        type: "Notes Changed",
        text: `${notes}`,
        media: [],
        time: Date.now(),
        open: this.mainUrl,
        points: this.config.points,
      });
    this.lastNotes = notes;
  }
}
