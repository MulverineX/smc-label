import { tag } from 'sandstone/commands';
import { Selector, SelectorClass } from 'sandstone/variables';
import { _ } from 'sandstone/_internals';

import { ConditionType } from 'sandstone/_internals/flow/conditions';
import { SelectorProperties } from 'sandstone/_internals/variables/selector';

/**
 * Label tag (/tag) handler
 */
export class LabelClass {
  /**
   * Label Tag name
   */
  public name;

  /**
   * Label Description (optional)
   */
  public description: string | boolean = false;

  public LabelHolder (entity: SelectorClass<true> | '@s' | '@p' | '@r') {
    if (typeof entity === 'string') 
      return new EntityLabel(Selector(entity), this);
    else
      return new EntityLabel(entity, this);
  }

  /**
   * Contains the name and description of the Label (eg. 'wasd:is_walking; Whether the player is not mounted')
   */
  public toString = () => `${this.name}${this.description ? `; ${this.description}` : ''}`

  constructor (name: string, description: string | false) {
    this.name = name

    if (description) this.description = description;
  }
}

export class EntityLabel {
  public label: LabelClass;

  public selector: SelectorClass<true>;
  
  public originalSelector: SelectorClass<true>;

  /**
   * Test for label on entity
   */
  public _toMinecraftCondition() {
    return { value: ['if', 'entity', this.selector.toString()] as any[] };
  };

  /** Test for label on entity */
  public test = this as ConditionType;

  /**
   * Add label to entity
   */
  public add = () => tag(this.originalSelector).add(this.label.name);

  /**
   * Set label on/off for entity
   */
  public set = (set: boolean | ConditionType) => {
    if (typeof set === 'boolean') {
      if (set) tag(this.originalSelector).add(this.label.name);

      else tag(this.originalSelector).remove(this.label.name);
    } else {
      _.if(set as ConditionType, () => tag(this.originalSelector).add(this.label.name))

      .else(() => tag(this.originalSelector).remove(this.label.name));
    }
  };

  /**
   * Remove label from entity
   */
  public remove = () => tag(this.originalSelector).remove(this.label.name);

  /**
   * Contains the selector, and the name/description of the Label (eg. 'Whether @s has the label wasd:is_walking; Whether the player is not mounted')
   */
  public toString = () => `Whether ${this.originalSelector.toString()} has the label ${this.label.toString()}`

  constructor (entity: SelectorClass<true>, label: LabelClass) {
    this.originalSelector = entity;
    this.label = label;

    if (entity.arguments) {
      if (entity.arguments.tag) {
        if (typeof entity.arguments.tag === 'string')
          entity.arguments.tag = [ entity.arguments.tag, label.name ];
        else
          entity.arguments.tag = [ ...entity.arguments.tag, label.name ];
      }
      else entity.arguments.tag = label.name;
    }
    else entity.arguments = { tag: label.name } as SelectorProperties<true, false>;

    this.selector = entity;
  }
}

/**
 * Creates a new label
 * @param label Label/tag name
 * @param description Label description (optional)
 */
export function newLabel(label: string, description: string | false = false) {
  return new LabelClass(label, description);
}

/**
 * Adds label to `@s`
 * @param label Label
 */
export function addLabel (label: LabelClass) {
  const target = label.LabelHolder('@s');
  target.add();
  return target;
};

/**
 * Removes label from `@s`
 * @param label Label
 */
export function removeLabel(label: LabelClass) {
  const target = label.LabelHolder('@s');
  target.remove();
  return target;
}

/**
 * Test for label on `@s`
 * @param label Label
 */
export function hasLabel(label: LabelClass) {
  return label.LabelHolder('@s').test
}