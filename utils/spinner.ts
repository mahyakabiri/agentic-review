export function spinner(label: string) {                                                                                                                                                                                   
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];                                                                                                                                                
    let i = 0;                                                                                                                                                                                                        
    const id = setInterval(() => {                                                                                                                                                                                    
      process.stdout.write(`\r${frames[i++ % frames.length]}  ${label}`);
    }, 80);                                                                                                                                                                                                           
                                                                                                                                                                                                                      
    return () => {
      clearInterval(id);                                                                                                                                                                                              
      process.stdout.write('\r\x1b[K'); // clear the line   
    };                                                                                                                                                                                                                
  }                                                         
