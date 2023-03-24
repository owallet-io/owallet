import images from '@src/assets/images';

//item 1:Dark, item 2: Light
const modeImages = {
  fail: [images.fail_dark, images.fail],
  line_fail_long: [images.line_fail_long_dark, images.line_faild_long],
  line_fail_short: [images.line_fail_short_dark, images.line_fail_short],
  pending: [images.pending_dark, images.pending],
  line_pending_long: [images.line_dark_pending_long, images.line_pending_long],
  line_pending_short: [images.line_pending_short_dark, images.line_pending_short],
  success:[images.success_dark, images.success],
  line_success_long:[images.line_sucess_long_dark, images.line_success_long],
  line_success_short:[images.line_success_short_dark, images.line_success_short],
};
const typeImagesTheme = () => modeImages;
type TypeTheme = { [P in keyof ReturnType<typeof typeImagesTheme>]: any };

const handleMode = (isDark): TypeTheme => {
  let data: any = {};
  if (isDark) {
    for (const property in modeImages) {
      data[property] = modeImages[property][0];
    }
  } else {
    for (const property in modeImages) {
      data[property] = modeImages[property][1];
    }
  }
  return data;
};

export const DarkModeImagesTheme: TypeTheme = { ...handleMode(true) };
export const LightModeImagesTheme: TypeTheme = { ...handleMode(false) };
