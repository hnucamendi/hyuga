export namespace main {
	
	export class Project {
	    id: string;
	    name: string;
	    created_at: string;
	    assets: string[];
	    metadata: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.created_at = source["created_at"];
	        this.assets = source["assets"];
	        this.metadata = source["metadata"];
	    }
	}

}

