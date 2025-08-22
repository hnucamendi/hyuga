export namespace main {
	
	export class AssetMetadata {
	    id: string;
	    sheet: string;
	    cutout: string;
	    pageNumber: string;
	    section: string;
	    model: string;
	
	    static createFrom(source: any = {}) {
	        return new AssetMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sheet = source["sheet"];
	        this.cutout = source["cutout"];
	        this.pageNumber = source["pageNumber"];
	        this.section = source["section"];
	        this.model = source["model"];
	    }
	}
	export class Model {
	    label: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new Model(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.value = source["value"];
	    }
	}
	export class Project {
	    id: string;
	    name: string;
	    created_at: string;
	    assets: AssetMetadata[];
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.created_at = source["created_at"];
	        this.assets = this.convertValues(source["assets"], AssetMetadata);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

