/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

import {
  h,
  app
} from 'hyperapp';

import {
  Box,
  BoxContainer,
  Image,
  Video
} from '@osjs/gui';

const view = (core, proc, win) =>
  (state, actions) => h(Box, {orientation: 'vertical'}, [
      h(BoxContainer, {grow: 1}, [
        state.image ? h(Image, {src: state.image.url, onload: (ev) => win.resizeFit(ev.target)}) : null,
        state.video ? h(Video, {src: state.video.url, onload: (ev) => win.resizeFit(ev.target)}) : null
      ].filter(i => !!i)),
    ]);

const actions = (core, proc, win) => {
  const setState = (key, value) => {
    return {[key]: value};
  };

  return {
    setVideo: video => state => ({video}),
    setImage: image => state => ({image})
  };
};

const openFile = async (core, proc, win, a, file) => {
  const url = await core.make('osjs/vfs').url(file.path);
  const ref = Object.assign({}, file, {url});

  if (file.mime.match(/^image/)) {
    a.setImage(ref)
  } else if (file.mime.match(/^video/)) {
    a.setVideo(ref);
  }

  win.setTitle(`${proc.metadata.title.en_EN} - ${file.filename}`);
  proc.args.file = file;
};


OSjs.make('osjs/packages').register('Preview', (core, args, options, metadata) => {
  const proc = core.make('osjs/application', {
    args,
    options,
    metadata
  });

  const state = {
    image: null,
    video: null
  };

  proc.createWindow({
    id: 'PreviewWindow',
    title: metadata.title.en_EN,
    state: {
      dimension: {width: 400, height: 400}
    }
  })
    .on('destroy', () => proc.destroy())
    .on('render', (win) => win.focus())
    .render(($content, win) => {
      const a = app(state,
          actions(core, proc, win),
          view(core, proc, win),
          $content);

          if (args.file) {
            openFile(core, proc, win, a, args.file);
          }
    })

  return proc;
});
