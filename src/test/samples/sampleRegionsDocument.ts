/**
 * This is a sample file to test the region parsing.
 */

// #region Imports
// import { SomeModule } from "example";
// import { AnotherModule } from "example";
// #endregion

// #region Classes

class MainClass {
  id: number;
  name: string;

  // #region Constructor
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
  // #endregion

  // #region Methods
  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  // #region Nested Method Region
  private logDetails(): void {
    console.log(`ID: ${this.id}, Name: ${this.name}`);
  }
  // #endregion
  // #endregion
}

// #region Sibling Classes
class AnotherClass {
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

// #region Another Nested Region
class FinalClass {
  field: number;
  constructor(field: number) {
    this.field = field;
  }
}
// #endregion
// #endregion

// #endregion

// #region Type Definitions
type User = { id: number; name: string };
// #endregion

// #region
const data = [1, 2, 3, 4];
console.log(data);
// #endregion
