import chalk from 'chalk';

export function spinner(label: string) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const id = setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i++ % frames.length])}  ${chalk.white(label)}`);
  }, 80);

  return () => {
    clearInterval(id);
    process.stdout.write('\r\x1b[K');
  };
}
