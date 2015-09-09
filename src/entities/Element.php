<?php

namespace MyApp\Entities;

/**
 * @Entity(repositoryClass="MyApp\Entities\Repositories\ElementRepository")
 * @Table(name="website_entities")
 */
class Element {
	/**
	 * @Id @Column(type="integer")
	 * @GeneratedValue
	 */
	private $id;
	/** @Column(type="text") */
	private $name;
	/** @Column(type="text") */
	private $summary_nl;
	/** @Column(type="text") */
	private $geom; //todo: give type geometry
	/**
	 * @ManyToOne(targetEntity="Layer")
	 * @JoinColumn(name="table", referencedColumnName="db_table")
	 */
	private $origin_table;

	public function getName() {
		return $this->name;
	}

	public function getSummary() {
		return $this->summary_nl;
	}

	public function getGeometry() {
		return $this->geom;
	}

	public function getLayer() {
		return $this->layer;
	}
}
