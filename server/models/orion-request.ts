export class OrionRequest {

  attributes = {};

  constructor(public entity_id: string,
              public fiware_service: string,
              public fiware_servicepath: string) {}

  addAttribute = (name: string, value: any, type: string) =>
    this.attributes[name] = {
      value: value,
      type: type
    }
}
