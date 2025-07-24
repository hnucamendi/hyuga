export namespace main {
	
	export class AssetMetadata {
	    id: string;
	    sheet: string;
	    cutout: string;
	    pageNumber: string;
	    section: string;
	    saved: boolean;
	
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
	        this.saved = source["saved"];
	    }
	}
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

