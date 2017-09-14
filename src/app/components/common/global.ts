export class Global {

  static getYears(futureyears) {
    const years: number[] = [];
    const today = new Date();
    const yy = today.getFullYear();
    for (let i = (yy + futureyears); i >= (yy - 100); i--) {
      years.push(i);
    }
    return years;
  }
}
