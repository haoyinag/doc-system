import { toggleMark } from "prosemirror-commands";
import { MenuItem } from "prosemirror-menu";
import { schema } from "./prosemirrorSchema";

export function buildMenuItems(schema) {
  let r = [];

  if (schema.marks.strong) {
    r.push(
      new MenuItem({
        title: "加粗",
        label: "B",
        enable(state) {
          return toggleMark(schema.marks.strong)(state);
        },
        run(state, dispatch) {
          toggleMark(schema.marks.strong)(state, dispatch);
        },
      })
    );
  }

  return [r];
}
